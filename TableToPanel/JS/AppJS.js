/*=========================================================================
 * Campos especiales sin columna para el label ( Asp:ValidationSummary, DataGridView, TextBox sin Etiqueta )
 * Que pasa con los campos ocultos.
 ==========================================================================*/

AppJS = (function () {

    //Propiedades y Variables
    var _version = "0.0.3";
    var _colsBootstrap = 12;
    var _tabla = "";
    var _intNumTotalFilas = 0;
    var _filasContenidos = "";    
    var _tieneCabecera = false;    
    var vl_boolHayBotonesEnUltimaFila = false;
    var _arrCols = [];
    var _sizeColBs = 3;

    

    var _plantillas = [
        "<div class=\"panel panel-default\"><div class=\"panel-heading\"><h4 class=\"text-primary\" runat=\"server\" id=\"Htmlh4Panel\">{{{heading}}}</h4></div><div class=\"panel-body\">{{{body}}}</div><div class=\"panel-footer\">{{{footer}}}</div></div>",
        "<div class=\"col-lg-{{{col}}} col-md-{{{col}}} col-sm-12 col-xs-12\"><div class=\"form-group\">{{{contenido}}}</div></div>",
        "<label id=\"HtmlLbl{{id}}\" runat=\"server\">{{{etiqueta}}}</label>",
        "<div class=\"row\">{{{cols}}}</div>",
        "<asp:Button ID=\"BtnConfirmar\" runat=\"server\" Text=\"Aceptar\" CssClass=\"btn btn-danger\" OnClick=\"BtnConfirmar_Click\" />",
        "<telerik:radcombobox ID=\"ddl{{{ID}}}\" runat=\"server\" emptymessage=\"\" filter=\"Contains\" markfirstmatch=\"true\" onclientblur=\"OnClientBlurRadComboBox\" rendermode=\"Lightweight\" skin=\"Bootstrap\" width=\"100%\"></telerik:radcombobox>",
        "<telerik: RadDatePicker RenderMode=\"Lightweight\" ID=\"txt{{{id}}}\" Width=\"100%\" Skin=\"Bootstrap\" runat =\"server\" MinDate=\"1/1/1900\" MaxDate=\"12/31/2999\" Enabled=\"False\" />",
        "<div class=\"table table-responsive\">{{{DataGridView}}}</div>",
        "<label id=\"{{id}}\" runat=\"server\">{{{etiqueta}}}</label>",
        "PagerStyle-CssClass=\"bs-pagination\" CssClass=\"table table-hover\" GridLines=\"None\" "
    ];

    var _ContenidoPanelBody = "";
    var _ContenidoPanelHeader = "";
    var _ContenidoPanelFooter = "";
    var _DataPanel = { "heading": "", "body": "", "footer": "" };
    var _DataCss = { "aceptar": "btn btn-primary", "cancelar": "btn btn-default","borrar":"btn btn-danger","nuevo":"btn btn-primary","sinclase":"btn btn-primary"};

    //Metodos Privados
    
    var CreateElemts=function(pe_Elemento,pe_plantillaMustache,pe_intAnchoColumna,pe_boolElementoConLabel=true) {
                
                var vista = { "col": pe_intAnchoColumna, "contenido": "" }
                var vistaEtiqueta = { "etiqueta": "" };        
                var vl_snippet = "";
                var vl_indiceElemento = -1;

                $(pe_Elemento).each(function (indice, elemento) {

                    var contenido = ($(elemento)[0].innerHTML);
                    
                    if (indice % 2 == 0) {
                        if (!TieneTaglabel(contenido)) {                           
                            var vl_strIdColumna = ObteneIdInput($(pe_Elemento[indice + 1])[0].innerHTML);
                            vistaEtiqueta.id = vl_strIdColumna;
                            vistaEtiqueta.etiqueta = contenido;                           
                            vl_snippet = Mustache.render(_plantillas[2], vistaEtiqueta);

                        } else {                        

                            //Recuperamos los atributos para comprobar si es un WebControl ( Si es un WebControl lo convertimos a una etiqueta.

                            var vl_LblID = null; // /ID="([^"]{1,}))"/i.exec(contenido)[1];
                            var vl_lblTexto = null; // /Text="([^"]{1,})/i.exec(contenido)[1];

                            var vl_arrData = /ID="([^"]{1,})"/i.exec(contenido);
                            if (vl_arrData != null) {
                                vl_LblID = vl_arrData[1];
                            }

                            vl_arrData = /Text="([^"]{1,})/i.exec(contenido);

                            if (vl_arrData != null) {
                                vl_lblTexto = vl_arrData[1];
                            }

                            if (vl_LblID != null && vl_lblTexto != null) {
                                var DataLbl = { "id": vl_LblID, "etiqueta": vl_lblTexto };
                                vl_snippet = Mustache.render(_plantillas[8],DataLbl);
                            } else {
                                vl_snippet = contenido + " ";
                            }

                            
                        }

                        vl_indiceElemento++;

                    } else {


                                             
                        //===== Remplazar ciertos controles  por controles de telerik =======

                        var vl_arrControles = [];
                        var m;
                        var regex = /<.+>/gmi;
                       
                       
                        while ((m = regex.exec(contenido)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === regex.lastIndex) {
                                regex.lastIndex++;
                            }
                            
                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                vl_arrControles.push(match);
                            });
                        }

                        //Comprobamos si existen controles calendario,localizadorBasico

                        var vl_boolHayCalendario = vl_arrControles.some(item => {                           
                            return (item.toLowerCase().indexOf(":calendarextender") > -1) ? true : false                           
                        });

                        var vl_boolHayLocalizador = vl_arrControles.some(item => {
                            return (item.toLowerCase().indexOf(":localizadorbasico") > -1) ? true : false 
                        });

                        if (vl_boolHayCalendario) {

                            var vl_DataPlantilla = { "id": "" };

                            vl_arrControles.forEach(item => {
                                var vl_strTipoControl = /:(\S*)/mi.exec(item);
                                switch (vl_strTipoControl[1]) {
                                    case "textbox":
                                        vl_DataPlantilla.id = ObteneIdInput(item);
                                        vl_snippet += "<!--" + item + "-->";
                                        break;
                                    case "imagebutton":
                                        vl_snippet += "<!--" + item + "-->";
                                        break;
                                    case "comparevalidator":

                                        if (/operator="DataTypeCheck"/i.test(item)) {
                                            vl_snippet += "<!--" + item + "-->";
                                        } else {
                                            vl_snippet += item;
                                        }
                                       
                                        break;
                                    case "requiredfieldvalidator":
                                        vl_snippet += item;
                                        break;
                                    case "calendarextender":
                                        vl_snippet += "<!--" + item + "-->";
                                        break;
                                   
                                }
                            });

                            vl_snippet += Mustache.render(_plantillas[6], vl_DataPlantilla);


                        } else if (vl_boolHayLocalizador) {

                            vl_strId = ObteneIdInput(contenido);
                            var vl_DataRadComboBox = { "ID": vl_strId };

                            vl_snippet += "<!--" + contenido + "-->";
                            vl_snippet += Mustache.render(_plantillas[5], vl_DataRadComboBox);

                        } else {

                            if (TieneClaseCss(contenido)) {
                                vl_snippet += ReemplazarClase(contenido, "form-control") + " ";
                            } else {
                                vl_snippet += AnadirCssClase(contenido, "form-control") + " ";
                            }           

                        }
                                                             
                        vl_indiceElemento++;
                    }

                    

                    if (vl_indiceElemento == 1) {
                        vista.contenido = vl_snippet;
                        _arrCols.push(Mustache.render(pe_plantillaMustache, vista));                        
                        vl_indiceElemento = -1;
                    }

                });
                
            }

    var TieneTaglabel=function(pe_elemento) {
         return (pe_elemento.toLowerCase().indexOf("label")==-1)?false:true;
     }

    var TieneClaseCss=function(pe_elemento) {

       
        var vl_boolSalida = false;
        if (pe_elemento.indexOf("class") != -1 || pe_elemento.indexOf("cssclass")!=-1){
            vl_boolSalida = true;
        }
       
        return vl_boolSalida;
    }

    var ReemplazarClase=function(pe_elemento,pe_nuevoValor) {

        
        var vl_strSalida = "";
       
        if (pe_elemento.search(/(asp:|telerick:|daypilot:|ajaxToolKit:)/) != -1) {
            vl_strSalida = pe_elemento.replace(/CssClass=\"[A-Z0-9]{1,}\"/gi, "CssClass=\"" + pe_nuevoValor + "\"");           
        } else {
            vl_strSalida = pe_elemento.replace(/class=\"[A-Z0-9]{1,}\"/gi,"class=\""+pe_nuevoValor+"\"");
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

            if (/^(uc)/i.test(vl_strId)) {
                vl_strSalida = vl_strId.slice(2);
            }

            if (/^(localizador)/i.test(vl_strId)) {
                vl_strSalida = vl_strId.slice(11);
            }


        } else {
            vl_strSalida = vl_strId;
        }
        
        return vl_strSalida;
    }

    var ObtenerCssClass=function(pe_strBoton){

        const regex = /CssClass="([A-Z0-9]{1,})"/i;
        var vl_arrResultado;
        
        var vl_strSalida = "sinclase";

        if ((vl_arrResultado = regex.exec(pe_strBoton)) !== null) {
            vl_strSalida = vl_arrResultado[1];
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

            if (!vl_boolHayBotonesEnUltimaFila) {
                intPosFinalContenidos++;
            }

            //Extraer Contenidos

            if (intPosInicialContenidos != intPosFinalContenidos) {                
                _filasContenidos = $(_tabla).find("tr").slice(intPosInicialContenidos, intPosFinalContenidos);                
            } else {
                _filasContenidos = $(ObtenerFila(intPosFinalContenidos));
            }
                
            
            /*console.log("_tieneCabecera : " + _tieneCabecera);
            console.log("boolHayBotonesEnUltimaFila : " + vl_boolHayBotonesEnUltimaFila);
            console.log("intPosInicialContenidos : " + intPosInicialContenidos);
            console.log("intPosFinalContenidos : " + intPosFinalContenidos);*/
           

        },

        CreatePanel: function () {
           
            var vl_strMensaje = "";
                      
            _filasContenidos.each(function (index, elemento) {       

                _sizeColBs = $("#HtmlTxtSizeCol").val();

                if ($(this).find("td").length % 2 == 0) {                               
                    CreateElemts($(this).find("td"), _plantillas[1],_sizeColBs);                  
                } else {                    
                    vl_strMensaje += "Row :" + index + " Bad Format<br>";                    
                    //CreateElemts($(this).find("td"), _plantillas[1], _sizeColBs,false);
                }              

            });

            if (vl_strMensaje === "") {
                vl_strMensaje = "All OK :)";
            }
                
            $("#divMensaje").text(vl_strMensaje);


            if (_tieneCabecera) {
                _ContenidoPanelHeader = $(ObtenerFila(0)).find("th").text();               
            }

            if (vl_boolHayBotonesEnUltimaFila) {                       
                var vl_htmlBotones = $(ObtenerFila(_intNumTotalFilas)).find("td").html();
                //console.log(vl_htmlBotones);

                /*Obtenemos los botones*/
                const regex = /<\s*asp:Button[^>]*/gi;

                while ((m = regex.exec(vl_htmlBotones)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, groupIndex) => {   

                        //Comprobamos si es un boton para eliminar
                        if (/(Eliminar|Borrar)/gi.test(match)) {
                            _ContenidoPanelFooter += _plantillas[4];
                            _ContenidoPanelFooter+= match.replace(/OnclientClick="\s*[^"]*"/gmi,"style=\"display:none\" />")

                        } else {
                            _ContenidoPanelFooter += ReemplazarClase(match, _DataCss[ObtenerCssClass(match)]) + "/>"; 
                        }


                                                                                            
                    });
                }

                
            }

            
            //Esperimental  

            var intTamRow = Math.ceil(_colsBootstrap / _sizeColBs);            
            PaginacionJS.Init(_arrCols, intTamRow);       

            for (i = 1; i <= PaginacionJS.Get("total_pages"); i++) {
                var vl_Pagina = PaginacionJS.Pagina(i);
                var vl_Data = { "cols": vl_Pagina };              
                _ContenidoPanelBody+= Mustache.render(_plantillas[3], vl_Data);
            }
            
            //Fin Esperimental


            _DataPanel.heading  = _ContenidoPanelHeader;
            _DataPanel.body     = _ContenidoPanelBody.replace(',',' ');
            _DataPanel.footer   = _ContenidoPanelFooter;

            $("#txtDestino").val(html_beautify(Mustache.render(_plantillas[0], _DataPanel)));

        },

        version: function () {
            alert(_version);
        }

    }

})();