(function MobileCore() {

    this.EUR_TO_USD = 1.4;

    /**
     * Страница подходит под урл?
     * @param url
     * @returns {boolean}
     */
    this.isMatchUrl = function (url) {
        return this.isMatchUrlRegExp(new RegExp(url));
    };

    /**
     * Страница подходит по регулярку урла?
     * @param regexp
     * @returns {boolean}
     */
    this.isMatchUrlRegExp = function (regexp) {
        return regexp.test(window.self.location.href);
    };

    /**
     * Извлекает целое число из строки.
     * @param str
     * @returns {Number}
     */
    this.parseIntFromStr = function (str) {
        var exec = /(\d+)/.exec(str);
        return (exec) ? parseInt(exec[1]) : 0;
    };

    /**
     * Извлекает дробное число из строки.
     * @param str
     * @returns {Number}
     */
    this.parseFloatFromStr = function (str) {
        var exec = /([\d.]+)/.exec(str);
        return (exec) ? parseFloat(exec[1]) : 0;
    };

    /**
     * Вырезает стоимость из строки
     * @param text
     * @returns {Number}
     */
    this.getPrice = function (text) {
        text = text.replace(/\s/, '');
        return this.parseIntFromStr(text);
    };

    /**
     * Рассчитываем возраст
     * @param vehicle
     */
    this.calcAge = function (vehicle) {
        var date = new Date();
        var now = {
            month: date.getMonth() + 1,
            year: date.getFullYear()
        };

        var years = now.year - vehicle.date.year;
        var months = now.month - vehicle.date.month;
        var age = years * 12 + months;
        vehicle.age = (age / 12).toFixed(1);

    };

    /**
     * Рассчет таможенных платежей для новых машин
     * @param vehicle
     */
    function calcForNew(vehicle) {
        // для < 8500
        var factor = {
            price: 0.54,
            displacement: 2.5
        };

        if (vehicle.priceGross > 8500) {
            factor.price = 0.48;
            if (vehicle.priceGross <= 16700) {
                factor.displacement = 3.5;
            } else if (vehicle.priceGross <= 42300) {
                factor.displacement = 5.5;
            } else if (vehicle.priceGross <= 84500) {
                factor.displacement = 7.5;
            } else if (vehicle.priceGross <= 169000) {
                factor.displacement = 15;
            } else {
                factor.displacement = 20;
            }
        }

        var percentFromPrice = factor.price * vehicle.priceGross;
        var priceForDisplacement = factor.displacement * vehicle.displacement;

        return Math.max(percentFromPrice, priceForDisplacement);
    }

    /**
     * Рассчет таможенных платежей для машин от 3 до 5 лет
     * @param vehicle
     */
    function calcForSecond(vehicle) {
        var factor;
        if (vehicle.displacement < 1000) {
            factor = 1.5;
        } else if (vehicle.displacement <= 1500) {
            factor = 1.7;
        } else if (vehicle.displacement <= 1800) {
            factor = 2.5;
        } else if (vehicle.displacement <= 2300) {
            factor = 2.7;
        } else if (vehicle.displacement <= 3000) {
            factor = 3;
        } else {
            factor = 3.6;
        }
        return factor * vehicle.displacement;
    }

    /**
     * Рассчет таможенных платежей для машин старше 5 лет
     * @param vehicle
     */
    function calcForOld(vehicle) {
        var factor;
        if (vehicle.displacement < 1000) {
            factor = 3;
        } else if (vehicle.displacement <= 1500) {
            factor = 3.2;
        } else if (vehicle.displacement <= 1800) {
            factor = 3.5;
        } else if (vehicle.displacement <= 2300) {
            factor = 4.8;
        } else if (vehicle.displacement <= 3000) {
            factor = 5;
        } else {
            factor = 5.7;
        }
        return factor * vehicle.displacement;
    }

    /**
     * Рассчет таможенных платежей
     * @param vehicle
     */
    this.calcCustomsClearance = function (vehicle) {
        if (vehicle.age < 3) {
            return calcForNew(vehicle);
        }
        if (vehicle.age < 5) {
            return calcForSecond(vehicle);
        }
        return calcForOld(vehicle);
    };

    /**
     * Форматированный вывод денег
     * @param price
     * @returns {string}
     */
    function formatPrice(price) {
        var re = '\\d(?=(\\d{3})+$)';
        return price.toFixed(0).replace(new RegExp(re, 'g'), '$& ');
    }

    /**
     * Выводим итоговую сумму
     */
    this.showResultPrice = function (vehicle, price) {
        vehicle.eur = price + vehicle.customsClearance;
        vehicle.usd = Math.round(vehicle.eur * this.EUR_TO_USD);
        vehicleDetails.append("<p style='font-size: 16px;'><b>" + formatPrice(vehicle.eur) + " EUR (" + formatPrice(vehicle.usd) + " $)</b></p>");
    };

    /**
     * Страница поиска
     */
    if (this.isMatchUrl("/auto-inserat/") || this.isMatchUrl("/fahrzeuge/")) {
        console.log("auto-inserat");

        var vehicle = {};

        var vehicleDetails = $('div.vehicleDetails:first');

        var priceGross = vehicleDetails.find("p.pricePrimaryCountryOfSale.priceGross");
        vehicle.priceGross = this.getPrice(priceGross.text());

        var priceNet = vehicleDetails.find("p.priceSecondaryCountryOfSale.priceNet");
        vehicle.priceNet = this.getPrice(priceNet.text());

        var date = vehicleDetails.find("p:contains('П.р.')").add("p:contains('FR')");
        var execDate = /(\d+)\/(\d+)/.exec(date.text());

        vehicle.date = {
            month: parseInt(execDate[1]),
            year: parseInt(execDate[2])
        };

        this.calcAge(vehicle);

        date.append(" <b>(" + vehicle.age + " г.)<b>");

        var dd = $("div.technicalDetailsColumn dt:contains('Объем двигателя:')").next("dd");
        vehicle.displacement = this.parseIntFromStr(dd.text());

        vehicle.customsClearance = Math.round(this.calcCustomsClearance(vehicle));

        vehicleDetails.append("<p>Таможенные пошлины: <b>" + formatPrice(vehicle.customsClearance) + " EUR</b></p>");

        this.showResultPrice(vehicle, vehicle.priceGross);

        if (vehicle.priceNet > 0) {
            this.showResultPrice(vehicle, vehicle.priceNet);
        }

        console.log(vehicle);

    }

})();
