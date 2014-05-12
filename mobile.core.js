(function MobileCore() {

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
     * Страница поиска
     */
    if (this.isMatchUrl("/auto-inserat/")) {
        console.log("auto-inserat");

        var vehicle = {};

        var vehicleDetails = $('div.vehicleDetails:first');

        var priceGross = vehicleDetails.find("p.pricePrimaryCountryOfSale.priceGross");
        vehicle.priceGross = this.getPrice(priceGross.text());

        var priceNet = vehicleDetails.find("p.priceSecondaryCountryOfSale.priceNet");
        vehicle.priceNet = this.getPrice(priceNet.text());

        console.log(vehicle);

    }

})();
