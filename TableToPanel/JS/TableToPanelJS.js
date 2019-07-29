

TableToPanelJS = (function () {

    //Propiedades y Variables
    var _version = "0.0.2";
    var _colsBootstrap = 12;
    var _tabla = "";
    var _intNumTotalFilas = 0;
    var _filasContenidos = "";    
    var _tieneCabecera = false;    
    var vl_boolHayBotonesEnUltimaFila = false;

    var _plantillas = [
        "<div class=\"panel panel-default\"><div class=\"panel-heading\"><h4 class=\"text-primary\" runat=\"server\" id=\"Htmlh4Panel\">{{{heading}}}<h4></div><div class=\"panel-body\">{{{body}}}</div><div class=\"panel-footer\">{{{footer}}}</div></div>",
        "<div class=\"col-lg-{{{col}}} col-md-{{{col}}} col-sm-12 col-xs-12\"><div class=\"form-group\">{{{contenido}}}</div></div>",
        "<label id=\"HtmlLbl{{id}}\" runat=\"server\">{{{etiqueta}}}</label>"
    ];

    var _ContenidoPanelBody = "";
    var _ContenidoPanelHeader = "";
    var _ContenidoPanelFooter = "";
    var _DataPanel = { "heading": "", "body": "", "footer": "" };

    //Metodos Privados
    
    var CreateElemts=function(pe_Elemento,pe_plantillaMustache,pe_intAnchoColumna) {

               

                var vl_strSalida = "";
                var vista = { "col": 3,"contenido":""}
                var vistaEtiqueta = { "etiqueta": "" };

                vista.col = pe_intAnchoColumna;
                var vl_snippet = "";
                var vl_indiceElemento = -1;

                $(pe_Elemento).each(function (indice, elemento) {

                    var contenido = ($(elemento)[0].innerHTML);

                   

                    if (indice % 2 == 0) {
                        if (!TieneTaglabel(contenido)) {
                            
                            var vl_strIdColumna = ObteneIdInput($(pe_Elemento[indice + 1])[0].innerHTML);

                            vistaEtiqueta.id = vl_strIdColumna;
                            vistaEtiqueta.etiqueta = contenido;                           
                            vl_snippet = Mustache.render(_plantillas[2],vistaEtiqueta);
                        } else {                           
                            vl_snippet = contenido + " ";
                        }

                        vl_indiceElemento++;

                    } else {
                                             

                        if (TieneClaseCss(contenido)) {
                            vl_snippet+= ReemplazarClase(contenido, "form-control")+ " ";
                        } else {
                            vl_snippet+= AnadirCssClase(contenido, "form-control")+ " ";
                        }                        
                        vl_indiceElemento++;
                    }

                    

                    if (vl_indiceElemento == 1) {
                        vista.contenido = vl_snippet;
                        vl_strSalida += Mustache.render(pe_plantillaMustache, vista);
                        vl_indiceElemento = -1;
                    }

                });


                //vista.contenido+= etiqueta + " " + control;
                //return Mustache.render(pe_plantillaMustache,vista)
                return vl_strSalida;

            }

    var TieneTaglabel=function(pe_elemento) {
         return (pe_elemento.toLowerCase().indexOf("label")==-1)?false:true;
     }

    var TieneClaseCss=function(pe_elemento) {

        var vl_boolSalida = false;
        if (pe_elemento.indexOf("class") != -1 || pe_elemento.indexOf("CssClass")!=-1){
            vl_boolSalida = true;
        }

        return vl_boolSalida;
    }

    var ReemplazarClase=function(pe_elemento,pe_nuevoValor) {

        var vl_strSalida = "";

        if (pe_elemento.search(/(asp:|telerick:|daypilot:|ajaxToolKit:)/) != -1) {
            vl_strSalida = pe_elemento.replace(/ClassCss=\"(.+)\"/i,"ClassCss='"+pe_nuevoValor+"'");
        } else {
            vl_strSalida = pe_elemento.replace(/class=\"(.+)\"/i,"class='"+pe_nuevoValor+"'");
        }

        return vl_strSalida;

    }

    var AnadirCssClase=function(pe_elemento, pe_nombreClase) {

        //Puede ser una etiqueta html o u webControl
        var propiedadCss = "CssClass=\""+pe_nombreClase+"\"";
        if (pe_elemento.search(/(asp:|telerik:|daypilot:|ajaxToolKit:)/)==-1) {
            propiedadCss = "class=\""+pe_nombreClase+"\"";
        }

        var posicion = pe_elemento.indexOf("/>");
        if (posicion == -1) {
            posicion = pe_elemento.indexOf(">");
        }

        return [pe_elemento.slice(0, posicion), propiedadCss, pe_elemento.slice(posicion)].join('');

    }

    var ObtenerFila = function (pe_intNumFila) {

        var vl_intIndice = (pe_intNumFila <= 0) ? 0 : pe_intNumFila - 1;

        return $(_tabla).find("tr")[vl_intIndice];
    }

    var ObtenerColumna=function(pe_intNumFila, pe_intColumna){

        var fila = $(_tabla).find("tr")[pe_intNumFila - 1];
        $(fila).find("td")[pe_intColumna - 1];
    }

    var ObteneIdInput=function(pe_strTagInput){

        const regex = /ID="([a-zA-Z0-9]{1,})"/i;
        var vl_arrResultado;
        var vl_strId = null;
        var vl_strSalida = "";

        if ((vl_arrResultado = regex.exec(pe_strTagInput)) !== null) {
            vl_strId = vl_arrResultado[1];
        }

        if (vl_strId != null) {
            if (/^(txt|ddl|chk|rbl)/i.test(vl_strId)) {
                vl_strSalida = vl_strId.slice(3);
            }
        } else {
            vl_strSalida = vl_strId;
        }
        
        return vl_strSalida;
    }

    var ExistenBotones = function (pe_elemento) {
        
        const regex = /(asp:Button|submit|button)/gmi;
        var vl_boolSalida = false;       

        if ((vl_arrResultado = regex.exec($(pe_elemento).html())) !== null) {
            vl_boolSalida = true;
        }
        
        return vl_boolSalida;
        
    }

    return {

        init: function (item) {
            
            _tabla = $(item);
            _intNumTotalFilas = _tabla.find("tr").length;
            var intPosInicialContenidos = 0;
            var intPosFinalContenidos = _intNumTotalFilas - 1;

            var primeraFila = $(_tabla).find("tr")[0];
            
            if ((_tabla.find("thead").length == 1) || $(primeraFila).find("th").length > 0) {
                _tieneCabecera = true;
                intPosInicialContenidos = 1;
                
            }
           
            //Tiene Pie (Botonera en la última fila)        

            var ultimaFila = _tabla.find("tr")[_intNumTotalFilas - 1];
                                                     
            vl_boolHayBotonesEnUltimaFila = ExistenBotones(ultimaFila);                             

            if ((_tabla.find("tfoot").length == 1 && vl_boolHayBotonesEnUltimaFila) ||
                (_tabla.find("tfoot").length == 0 && vl_boolHayBotonesEnUltimaFila)) {
                intPosFinalContenidos--;
            }

            //Extraer Contenidos

            if (intPosInicialContenidos < intPosFinalContenidos)
                _filasContenidos = $(_tabla).find("tr").slice(intPosInicialContenidos, intPosFinalContenidos);
            else
                _filasContenidos = $(ObtenerFila(intPosFinalContenidos));
            
            console.log("_tieneCabecera : " + _tieneCabecera);
            console.log("boolHayBotonesEnUltimaFila : " + vl_boolHayBotonesEnUltimaFila);
            console.log("intPosInicialContenidos : " + intPosInicialContenidos);
            console.log("intPosFinalContenidos : " + intPosFinalContenidos);
            console.log($(_filasContenidos).html());

        },

        CreatePanel: function () {
           
            var vl_strMensaje = "";
                      
            _filasContenidos.each(function (index, elemento) {       

                var vl_anchoColumnaPanel = Math.ceil(_colsBootstrap / $(this).find("td").length);

                if ($(this).find("td").length % 2 == 0) {
                    _ContenidoPanelBody += CreateElemts($(this).find("td"), _plantillas[1], vl_anchoColumnaPanel);
                } else {
                    vl_strMensaje += "Fila :" + index + " Mal Formada<br>";
                }              

            });

            if (vl_strMensaje === "") {
                vl_strMensaje = "Generación Correcta :)";
            }
                
            $("#divMensaje").text(vl_strMensaje);


            if (_tieneCabecera) {
                _ContenidoPanelHeader = $(ObtenerFila(0)).find("th").text();               
            }

            if (vl_boolHayBotonesEnUltimaFila) {              
                _ContenidoPanelFooter = $(ObtenerFila(_intNumTotalFilas)).find("td").html();
            }

            _DataPanel.heading  = _ContenidoPanelHeader;
            _DataPanel.body     = _ContenidoPanelBody;
            _DataPanel.footer   = _ContenidoPanelFooter;

            $("#txtDestino").val(html_beautify(Mustache.render(_plantillas[0], _DataPanel)));

        },

        version: function () {
            alert(_version);
        }

    }

})();