PaginacionJS = (function () {

    
    var _PAGE_SIZE;
    var _CURRENT_PAGE;
    var _TOTAL_PAGES;
    var _DATA_SOURCE;

    return {

        Init: function (pe_dataSource, pe_intPageSize) {

            _DATA_SOURCE = pe_dataSource;
            _PAGE_SIZE = pe_intPageSize;
            _TOTAL_PAGES = Math.ceil(_DATA_SOURCE.length / _PAGE_SIZE);

        },

        Pagina: function (pe_intPagina) {

            var vl_arrSalida = null;

            if (_TOTAL_PAGES >= pe_intPagina) {
                var vl_intPag = pe_intPagina-1;
                var vl_intIni = vl_intPag * _PAGE_SIZE;
                var vl_intFin = vl_intIni + _PAGE_SIZE;

                /*console.log("vl_intPag = " + vl_intPag);
                console.log("vl_intIni = " + vl_intIni);
                console.log("vl_intFin = " + vl_intFin);*/

                vl_arrSalida = _DATA_SOURCE.slice(vl_intIni, vl_intFin);
            }

            return vl_arrSalida;
        },

        Version: function () {
            alert("PaginacionJS version : 0.0.1");
        },

        Get: function (pe_strPropiedad) {
            switch (pe_strPropiedad.toLowerCase()) {
                case "page_size":
                    return _PAGE_SIZE;
                case "total_pages":
                    return _TOTAL_PAGES;
            }
        }

    }

})();