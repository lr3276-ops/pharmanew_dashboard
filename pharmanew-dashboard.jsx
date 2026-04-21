import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://yhfkbezlivglnciqgfkp.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmtiZXpsaXZnbG5jaXFnZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDI4NDQsImV4cCI6MjA5MjM3ODg0NH0.qHBIbXW8GMpG38xgaqfLSsugRzJLblLzeqV36y3WTKQ";
const sb = {
  async select(table) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
    return r.json();
  },
  async insert(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(data) });
    return r.json();
  },
};

const B = { navy:"#245293", green:"#519831", blue:"#0872c7", orange:"#f89600", dkOrange:"#db6204", sky:"#d2edfa", lime:"#dcf0a9", dark:"#1a2a3a", mid:"#4a5a6a", light:"#f4f7fb", border:"#e4edf8" };
const REPS = ["Laura","Miguel","David"];
const REP_COLORS = { Laura: B.blue, Miguel: B.green, David: B.dkOrange };
const CALL_TYPES = ["Office Visit","Hospital Round","Lunch & Learn","Virtual Detail","Conference / Event","Follow-up Call"];
const OUTCOMES = ["Rx Commitment","Formulary Discussion","Sample / Literature Drop","Scheduled Follow-up","Needs More Info","Not Interested","No Access"];
const OC = { "Rx Commitment":B.green, "Formulary Discussion":B.blue, "Sample / Literature Drop":B.orange, "Scheduled Follow-up":"#8b5cf6", "Needs More Info":"#d97706", "Not Interested":"#ef4444", "No Access":"#94a3b8" };
const PRODUCTS = ["Xifaxan","Linzess","Motegrity","Trulance","Carafate","Suprep","Other"];

const PROVIDERS = [{"id":1,"name":"Dr. JORGE CORTES RUIZ","address":"INSTITUTO SAN PABLO","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":2,"name":"Dr. ROGER POLISH","address":"TORRE SAN PABLO","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":3,"name":"Dr. RICARDO MARRERO","address":"TORRE SAN PABLO","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":4,"name":"Dr. ROBERTO OSORIO MANOTAS","address":"PASEO SAN PABLO 100","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":5,"name":"Dr. SANTIAGO COSTE SIBILIA","address":"BAYAMAN MEDICAL PLAZA","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":6,"name":"Dr. RAFAEL SOLIS MOUNIER","address":"1845 CARR","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":7,"name":"Dr. MELVYN ACOSTA FEBO","address":"ADLER MEDICAL PLAZA SUITE 405","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":8,"name":"Dr. RAFAEL PASTRANA LABORDE","address":"735 AVE PONCE DE LEON SUITE 816","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":9,"name":"Dr. HECTOR LOZANO RUIZ","address":"735 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":10,"name":"Dr. YAHAIRA MORENO","address":"735 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00919","specialty":"GI"},{"id":11,"name":"Dr. JOSE RIVERA ACOSTA","address":"735 PONCE DE LEON","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":12,"name":"Dr. ARNALDO LASA IMBERT","address":"735 PONCE DE LEON TORRE AUXILIO MUTUO","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":13,"name":"Dr. ZHAMARIE ORTIZ MERCADO","address":"735 AVENIDA PONCE DE LEON","city":"SAN JUAN","zip":"00919","specialty":"GI"},{"id":14,"name":"Dr. YOMARID QUINONES","address":"2191 AVENIDA MILITAR CARRETERA 2","city":"ISABELA","zip":"00662","specialty":"GI"},{"id":15,"name":"Dr. LILIANA MORALES","address":"1449 Americo Salas Edificio Pavia 2","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":16,"name":"Dr. DIANA COLON GORBEA","address":"554 CALLE CABO H ALVERIO","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":17,"name":"Dr. JOSE REYES","address":"400 AVE FD ROOSEVELT","city":"SAN JUAN","zip":"00918","specialty":"CRC"},{"id":18,"name":"Dr. MARLA TORRES TORRES","address":"400 AVE FD ROOSEVELT","city":"SAN JUAN","zip":"00918","specialty":"CRC"},{"id":19,"name":"Dr. MYRIAM VILLAFANA SUAREZ DE VINCE","address":"400 AVE FD ROOSEVELT","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":20,"name":"Dr. RAMON RULLAN","address":"68 CALLE SANTA CRUZ","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":21,"name":"Dr. CARLOS FERNANDEZ","address":"1801 AVENIDA PONCE DE LEON","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":22,"name":"Dr. RODOLFO ESTREMERA MARCIAL","address":"1801 AVENIDA PONCE DE LEON","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":23,"name":"Dr. SUZETTE RIVERA MACMURRAY","address":"1431 AVENIDA PONCE DE LEON","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":24,"name":"Dr. VERONICA BEYLEY PAGAN","address":"1431 AVENIDA PONCE DE LEON","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":25,"name":"Dr. JORGE CRUZ CRUZ","address":"CALLE J 13 ESQ CALLE B3 URB","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":26,"name":"Dr. FEDERICO RODRIGUEZ PEREZ","address":"1420 AMERICA SALAS","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":27,"name":"Dr. VEROUSHKA BALLESTER VARGAS","address":"1449 AMERICO SALAS","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":28,"name":"Dr. WILFREDO PAGANI DIAZ","address":"29 CALLE WASHINGTON","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":29,"name":"Dr. ALLAN SANTIAGO PACHECO","address":"29 WASHINGTON ST","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":30,"name":"Dr. FRANCES RODRIGUEZ BARRIOS","address":"COBIAN PLAZA 1607 SUITE GM-04","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":31,"name":"Dr. LUIS ECHENIQUE GAZTAMBIDE","address":"735 AVENIDA PONCE DE LEON","city":"SAN JUAN","zip":"00919","specialty":"CRS"},{"id":32,"name":"Dr. RAFAEL RODRIGUEZ LOPEZ","address":"TORRE MEDICA AUXILIO MUTUO","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":33,"name":"Dr. JOSE JIMENEZ GARCIA","address":"735 AVE. PONCE DE LEON","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":34,"name":"Dr. MANUEL IMBERT GARRATON","address":"AVE PONCE DE LEON 735","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":35,"name":"Dr. KERMIT RICHIEZ COLON","address":"735 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":36,"name":"Dr. CONRADO ASENJO MAYORAL","address":"369 AVE DE DIEGO","city":"SAN JUAN","zip":"00923","specialty":"GI"},{"id":37,"name":"Dr. FRANCISCO VIZCARRONDO TERRON","address":"AVENIDA GENERAL VALERO 305","city":"FAJARDO","zip":"00738","specialty":"GI"},{"id":38,"name":"Dr. FERNANDO RAMOS MERCADO","address":"400 F D ROOSVELT AVE SYE 206","city":"HATO REY","zip":"00918","specialty":"GI"},{"id":39,"name":"Dr. MANUEL MONTALVO RECIO","address":"10 19 CALLE 3 SANTA ROSA","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":40,"name":"Dr. LUIS TOUS LOPEZ","address":"400 AVE FD ROOSEVELT","city":"SAN JUAN","zip":"00918","specialty":"CRS"},{"id":41,"name":"Dr. RICKY JIMENEZ CARLO","address":"GTEC 29 WASHINGTON ST","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":42,"name":"Dr. EMMANUEL WARRINGTON","address":"AVE PRINCIPAL ESQ. CALLE 31","city":"CAGUAS","zip":"00727","specialty":"GI"},{"id":43,"name":"Dr. LOSCAR SANTIAGO RIVERA","address":"1420 AMERICAN SALAS","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":44,"name":"Dr. ARTEMIO SANTIAGO","address":"VILLA MARINA PLAZA","city":"GURABO","zip":"00778","specialty":"GI"},{"id":45,"name":"Dr. FELIPE VELEZ GONZALEZ","address":"URBANIZACION GARCIA #47","city":"ARECIBO","zip":"00612","specialty":"GI"},{"id":46,"name":"Dr. MARTIN ORTIZ CAMACHO","address":"CALLE JUAN J JIMENEZ N","city":"HATO REY","zip":"00918","specialty":"GI"},{"id":47,"name":"Dr. CAROL TORRES COTTO","address":"GALERIA PACIFICO","city":"ARECIBO","zip":"00613","specialty":"GI"},{"id":48,"name":"Dr. RENE ROCHA RODRIGUEZ","address":"CARR 129","city":"ARECIBO","zip":"00613","specialty":"GI"},{"id":49,"name":"Dr. ALBERTO ZAMOT CARMONA","address":"LOCAL 24 PLAZA DORADO","city":"DORADO","zip":"00646","specialty":"GI"},{"id":50,"name":"Dr. SEGUNDO RODRIGUEZ QUILICHINI","address":"611 PAVIA ST","city":"SAN JUAN","zip":"00910","specialty":"CRS"},{"id":51,"name":"Dr. ROBERTO VENDRELL WHITNEY","address":"11 CALLE CARAZO","city":"GUAYNABO","zip":"00969","specialty":"GI"},{"id":52,"name":"Dr. ABDIEL CRUZ LOUBRIEL","address":"CALLE CARAZO 11","city":"GUAYNABO","zip":"00969","specialty":"GI"},{"id":53,"name":"Dr. RICARDO ARROYO ARROYO","address":"AVENIDA CASA LINDA 1 CARR","city":"BAYAMON","zip":"00970","specialty":"GI"},{"id":54,"name":"Dr. JOSE MUNOZ ACABA","address":"200 AVE WINSTON CHURCHILL","city":"SAN JUAN","zip":"00926","specialty":"GI"},{"id":55,"name":"Dr. VIRGEN BAEZ HERNANDEZ","address":"CALLE 15 N24 AVE. MUNOZ MARIN","city":"CAGUAS","zip":"00725","specialty":"GI"},{"id":56,"name":"Dr. ALEXIS GONZALES","address":"TORRE HOSPITAL METROPOLITANO","city":"SAN JUAN","zip":"00921","specialty":"GI"},{"id":57,"name":"Dr. JUAN MARQUES LESPIER","address":"200 CARR. 2 SUITE 258","city":"MANATI","zip":"00674","specialty":"GI"},{"id":58,"name":"Dr. RAFAEL TIRADO MONTIJO","address":"PASEO ATENAS #93","city":"MANATI","zip":"00674","specialty":"GI"},{"id":59,"name":"Dr. ROBERT RODRIGUEZ","address":"PASEO ATENAS #93","city":"MANATI","zip":"00674","specialty":"GI"},{"id":60,"name":"Dr. HENRY DE JESUS DE LA CRUZ","address":"AVE SANCHEZ OSORIO VILLA FONTANA","city":"CAROLINA","zip":"00984","specialty":"GI"},{"id":61,"name":"Dr. ROCIO DOMINGUEZ","address":"101 AVE SAN PATRICIO","city":"GUAYNABO","zip":"00968","specialty":"GI"},{"id":62,"name":"Dr. FEDERICO GREGORY GONZALEZ","address":"101 AVE SAN PATRICIO","city":"GUAYNABO","zip":"00968","specialty":"GI"},{"id":63,"name":"Dr. EMMANUEL REYES RAMOS","address":"363 AVE ESCORIAL","city":"SAN JUAN","zip":"00902","specialty":"GI"},{"id":64,"name":"Dr. CARLOS LABOY OLIVIERI","address":"CARRETERA 129 HOSPITAL PAVIA","city":"ARECIBO","zip":"00613","specialty":"GI"},{"id":65,"name":"Dr. RAMON MARRERO MALDONADO","address":"EDIFICIO GALERIA MEDICA","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":66,"name":"Dr. JEFFREY HERNANDEZ RODRIGUEZ","address":"HOSPITAL MENONITA EDIFICIO PROFESIONAL","city":"CAYEY","zip":"00736","specialty":"GI"},{"id":67,"name":"Dr. YADIRA CORREA MILLAN","address":"SANTA ROSA 6-26 CALLE 7","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":68,"name":"Dr. JOHAM SENIOR MARINO","address":"1845 CARR 2","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":69,"name":"Dr. NICOLAS LOPEZ ACEVEDO","address":"400 AVE FD ROOSEVELT","city":"SAN JUAN","zip":"00918","specialty":"CRS"},{"id":70,"name":"Dr. MICHELLE RIVERA RESTO","address":"50 CALLE VICTORIA","city":"HUMACAO","zip":"00791","specialty":"GI"},{"id":71,"name":"Dr. JAVIER ARROYO CAMUNA","address":"CALLE FONT MARTELO 201","city":"HUMACAO","zip":"00791","specialty":"GI"},{"id":72,"name":"Dr. CARLOS JIMENEZ HUKE","address":"SUITE A2 CARRETERA 908 KM 0.4","city":"HUMACAO","zip":"00792","specialty":"GI"},{"id":73,"name":"Dr. MIGUEL DEVARONA NEGRON","address":"HIMA PLAZA I","city":"CAGUAS","zip":"00725","specialty":"GI"},{"id":74,"name":"Dr. VICTOR COLON VAZQUEZ","address":"GAUTIER BENITEZ AVE","city":"CAGUAS","zip":"00725","specialty":"GI"},{"id":75,"name":"Dr. NELSON VALENTIN-FELICIANO","address":"200 CALLE HERNANDEZ CARRION STE 512","city":"MANATI","zip":"00674","specialty":"GI"},{"id":76,"name":"Dr. SAMUEL RIVERA DE JESUS","address":"200 CALLE HERNANDEZ CARRION","city":"MANATI","zip":"00674","specialty":"GI"},{"id":77,"name":"Dr. IAN PADIAL DOBLE","address":"ANEXO OFICINAS MEDICAS PISO 2 B1","city":"CAGUAS","zip":"00725","specialty":"GI"},{"id":78,"name":"Dr. LUIS NAVARRO TORRES","address":"369 CALLE DE DIEGO","city":"RIO PIEDRAS","zip":"00923","specialty":"GI"},{"id":79,"name":"Dr. IVAN ANTUNEZ GONZALEZ","address":"735 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":80,"name":"Dr. SULIMAR RODRIGUEZ","address":"#1789 CARR. 21 SUITE 210","city":"SAN JUAN","zip":"00921","specialty":"GI"},{"id":81,"name":"Dr. RAUL MARQUEZ SANTIAGO","address":"AVE UNIVERSIDAD INTERAMERICANA","city":"SAN GERMAN","zip":"00683","specialty":"GI"},{"id":82,"name":"Dr. MARIA RIOS ENRIQUEZ","address":"100 CALLE HERNAN ALVAREZ","city":"SAN GERMAN","zip":"00683","specialty":"GI"},{"id":83,"name":"Dr. FERNANDO BONILLA VALENTIN","address":"STE 504 CARR 2 KM 173","city":"SAN GERMAN","zip":"00683","specialty":"GI"},{"id":84,"name":"Dr. FRANCISCO TORRES","address":"24312 AVE LAS AMERICAS","city":"PONCE","zip":"00717","specialty":"GI"},{"id":85,"name":"Dr. BARBARA ROSADO CARRION","address":"2431 AVE LAS AMERICAS","city":"PONCE","zip":"00717","specialty":"GI"},{"id":86,"name":"Dr. JOEL DE JESUS CARABALLO","address":"222 URBANIZACION VIVES CALLE 4","city":"GUAYAMA","zip":"00784","specialty":"GI"},{"id":87,"name":"Dr. WALISBETH CLASS VAZQUEZ","address":"239 ARTERIAL HOSTOS AVE","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":88,"name":"Dr. VASCO EGUIA","address":"1607 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":89,"name":"Dr. EKIE VAZQUEZ","address":"VRB REXVILLE CALLE 1 C11","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":90,"name":"Dr. JOSE TORRES VEGA","address":"450 CALLE FERROCARRIL","city":"PONCE","zip":"00717","specialty":"GI"},{"id":91,"name":"Dr. LUIS MARTINEZ SIERRA","address":"450 CALLE FERROCARRIL","city":"PONCE","zip":"00717","specialty":"GI"},{"id":92,"name":"Dr. RAFAEL MARTIR GUEVARA","address":"450 CALLE FERROCARRIL","city":"PONCE","zip":"00717","specialty":"GI"},{"id":93,"name":"Dr. ARNALDO NIEVES RAMIREZ","address":"7810 CALLE NAZARETH","city":"PONCE","zip":"00732","specialty":"GI"},{"id":94,"name":"Dr. NESTOR APONTE REYES","address":"200 CARR 2","city":"MANATI","zip":"00674","specialty":"GI"},{"id":95,"name":"Dr. HENRY GONZALEZ RIVERA","address":"TORRE MEDICA","city":"SAN JUAN","zip":"00921","specialty":"GI"},{"id":96,"name":"Dr. PRISCILLA MAGNO","address":"435 AVE PONCE DE LEON 3RD FLOOR","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":97,"name":"Dr. HENDRICK PAGAN TORRES","address":"AVE CASA LINDA 1 CARR","city":"GUAYNABO","zip":"00970","specialty":"GI"},{"id":98,"name":"Dr. WALTER JANER MARTINEZ","address":"73 CALLE SANTA CRUZ","city":"BAYAMON","zip":"00978","specialty":"GI"},{"id":99,"name":"Dr. AHMED MORALES JORGE","address":"Plaza San Cristobal Local #3","city":"COTO LAUREL","zip":"00780","specialty":"GI"},{"id":100,"name":"Dr. HARRY RODRIGUEZ","address":"TORRE SAN CRISTOBAL","city":"COTO LAUREL","zip":"00780","specialty":"GI"},{"id":101,"name":"Dr. CARMEN SANTIAGO MUNOZ","address":"909 AVE TITO CASTRO","city":"PONCE","zip":"00716","specialty":"GI"},{"id":102,"name":"Dr. WILSON ORTIZ COTTI","address":"Urb. Atenas Calle Hernandez Carrion E-24","city":"MANATI","zip":"00674","specialty":"GI"},{"id":103,"name":"Dr. ELADIO PEREZ CRUZ","address":"1449 AMERICO SALAS","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":104,"name":"Dr. ARNALDO ROSA TORRENS","address":"3 CALLE DOLORES CABRERA ALONSO W","city":"HUMACAO","zip":"00791","specialty":"GI"},{"id":105,"name":"Dr. JOSE BAEZ TORRES","address":"CALLE MEDITACION 55 OFICINA GA","city":"MAYAGUEZ","zip":"00977","specialty":"GI"},{"id":106,"name":"Dr. HIRAM ORTEGA","address":"CARRETERA 115 KM 255","city":"AGUADA","zip":"00602","specialty":"GI"},{"id":107,"name":"Dr. OMAR PEREZ JIMENEZ","address":"EDIFICIO MEDICAL EMPORIUM 202","city":"MAYAGUEZ","zip":"00977","specialty":"GI"},{"id":108,"name":"Dr. VICTOR CARLO CHEVERE","address":"CALLE DOCTOR TROYER","city":"AIBONITO","zip":"00705","specialty":"GI"},{"id":109,"name":"Dr. HECTOR PEREZ ARROYO","address":"TORRE DEL METROPOLITANO 1789","city":"SAN JUAN","zip":"00921","specialty":"GI"},{"id":110,"name":"Dr. RAFAEL MEDINA PRIETO","address":"150 CALLE LUCIA VAZQUES STE 150","city":"CAYEY","zip":"00736","specialty":"GI"},{"id":111,"name":"Dr. RAFAEL MEDINA RIVERA","address":"150 CALLE LUCIA VAZQUEZ S","city":"CAYEY","zip":"00736","specialty":"GI"},{"id":112,"name":"Dr. AMARILYS SANTIAGO ROLON","address":"PORTOFINO PLAZA CARR. #3 158.7","city":"SALINAS","zip":"00751","specialty":"GI"},{"id":113,"name":"Dr. YAIZA MARTINEZ ORTIZ","address":"29 WASHINGTON SUITE 601-602","city":"SAN JUAN","zip":"00907","specialty":"GI"},{"id":114,"name":"Dr. FABIOLA RIOS DE CHOUDENS","address":"PASEO SAN PABLO 100 SUITE 210","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":115,"name":"Dr. NATALIA BLANCO CINTRON","address":"435 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":116,"name":"Dr. ROBERTO MERA LASTRA","address":"CALLE A CASA 12 RIO GRANDE HILLS","city":"RIO GRANDE","zip":"00745","specialty":"GI"},{"id":117,"name":"Dr. VICTOR RODRIGUEZ RAPALE","address":"400 AVE FD ROOSEVELT","city":"SAN JUAN","zip":"00918","specialty":"CRS"},{"id":118,"name":"Dr. JAVIER CERRA FRANCO","address":"Hospital Menonita Edificio Profesional","city":"CAYEY","zip":"00736","specialty":"GI"},{"id":119,"name":"Dr. JAIME ROSADO MUNOZ","address":"735 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":120,"name":"Dr. WILFREDO VAZQUEZ OLIVENCIA","address":"2225 PONCE BY PASS","city":"PONCE","zip":"00731","specialty":"GI"},{"id":121,"name":"Dr. JOSE NAJUL ZAMBRANA","address":"53 CALLE ANA LENS DE SUSONI","city":"ARECIBO","zip":"00612","specialty":"GI"},{"id":122,"name":"Dr. IRENE VILLAMIL SANCHEZ","address":"CLINICAS ESCUELA MEDICINA UPR 2 FLOOR","city":"SAN JUAN","zip":"00921","specialty":"GI"},{"id":123,"name":"Dr. RAFAEL MOSQUERA FERNANDEZ","address":"AVE PADRE RIVERA","city":"HUMACAO","zip":"00791","specialty":"GI"},{"id":124,"name":"Dr. JOSE RIOS COLLAZO","address":"AVE PADRE RIVERA 101","city":"HUMACAO","zip":"00791","specialty":"GI"},{"id":125,"name":"Dr. YAMILKA ABREUDELGADO","address":"#267 CARR. 198 KM 21.7 BARBOSA","city":"LAS PIEDRAS","zip":"00771","specialty":"GI"},{"id":126,"name":"Dr. JOSE VEGA MARTINEZ","address":"CALLE JOSE DE DIEGO #153","city":"ARECIBO","zip":"00612","specialty":"GI"},{"id":127,"name":"Dr. PRISCILLA MEDERO","address":"Carr #2 Km 156.5 Office Park I Suite 201","city":"MAYAGUEZ","zip":"00682","specialty":"GI"},{"id":128,"name":"Dr. IVONNE FIGUEROA RIVERA","address":"CALLE JOSE DE DIEGO","city":"ARECIBO","zip":"00612","specialty":"GI"},{"id":129,"name":"Dr. FELIX RIVERA BORGES","address":"60 N CALLE POST OFIC 205","city":"MAYAGUEZ","zip":"00977","specialty":"GI"},{"id":130,"name":"Dr. CARLOS MICAMES CACERES","address":"CALLE DR BASORA 55 NORTE","city":"MAYAGUEZ","zip":"00977","specialty":"GI"},{"id":131,"name":"Dr. MEREDITH PORTALATIN PEREZ","address":"HOSPITAL PAVIA CARRETERA 129","city":"ARECIBO","zip":"00613","specialty":"GI"},{"id":132,"name":"Dr. VIVIANA CABAN","address":"51 MENDEZ VIGO ST","city":"MAYAGUEZ","zip":"00977","specialty":"GI"},{"id":133,"name":"Dr. DAVID RIVERA ORTIZ","address":"1845 CARR 2","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":134,"name":"Dr. PEDRO PANELLI","address":"909 AVE TITO CASTRO","city":"PONCE","zip":"00716","specialty":"GI"},{"id":135,"name":"Dr. REINALDO RAMIREZ AMILL","address":"ROVIRA OFFICE PARK","city":"PONCE","zip":"00717","specialty":"GI"},{"id":136,"name":"Dr. FERNANDO MARTINEZ COLON","address":"435 AVE PONCE DE LEON 3RD FLOOR","city":"SAN JUAN","zip":"00917","specialty":"CRS"},{"id":137,"name":"Dr. DAGMARY PURCELL AREVALO","address":"ROSADO BUILDING","city":"HUMACAO","zip":"00791","specialty":"GI"},{"id":138,"name":"Dr. DILKA GONZALEZ ORTIZ","address":"AVENIDA ANTONIO R BARCELO","city":"CAYEY","zip":"00736","specialty":"GI"},{"id":139,"name":"Dr. FERNANDO BAEZ","address":"EXPRESO TRUJILLO ALTO K.M 2.1","city":"TRUJILLO ALTO","zip":"00976","specialty":"GI"},{"id":140,"name":"Dr. RAFAEL PEREZ BARTOLOMEI","address":"B40 CALLE ELLIOT VELEZ","city":"MANATI","zip":"00674","specialty":"GI"},{"id":141,"name":"Dr. PABLO COSTAS CACERES","address":"MUNOZ RIVERA NO 1056","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":142,"name":"Dr. ROBERTO CASANOVA GUARDIOLA","address":"735 AVE PONCE DE LEON","city":"SAN JUAN","zip":"00917","specialty":"GI"},{"id":143,"name":"Dr. HARRY RUIZ FIGUEROA","address":"HOSPITAL MENONITA","city":"CAGUAS","zip":"00725","specialty":"GI"},{"id":144,"name":"Dr. WILDRES HERNANDEZ ALICIA","address":"GALERIA PACIFICO CARR 10 KM 857","city":"ARECIBO","zip":"00613","specialty":"GI"},{"id":145,"name":"Dr. SANTIAGO COSTES SIBILIA","address":"TORRE A SUITE 306","city":"BAYAMON","zip":"00959","specialty":"GI"},{"id":146,"name":"Dr. CARLOS LATIMER ARSUAGA","address":"EDIF DR ARTURO CADILLA VINAS","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":147,"name":"Dr. GERARDO QUEVEDO BONILLA","address":"EDIF MEDICO. SANTA CRUZ","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":148,"name":"Dr. LORENA MORALES CONCEPCION","address":"ANEXO OFICINAS MEDICAS PISO 2 B1","city":"CAGUAS","zip":"00725","specialty":"GI"},{"id":149,"name":"Dr. FRAY ARROYO MERCADO","address":"200 CALLE HERNANDEZ CARRION","city":"MANATI","zip":"00674","specialty":"GI"},{"id":150,"name":"Dr. GINES MARTINEZ MANGUAL","address":"HOSPITAL CENTRO COMPRENSIVO CANCER UPR","city":"SAN JUAN","zip":"00936","specialty":"GI"},{"id":151,"name":"Dr. EDWARD SINGH SUNPAUL","address":"69N CALLE DR RAMON E BETANCES S","city":"MAYAGUEZ","zip":"00977","specialty":"GI"},{"id":152,"name":"Dr. KARLA AMARAL","address":"AVE PRINCIPAL SECTOR VALLE TOLIMA","city":"CAGUAS","zip":"00727","specialty":"GI"},{"id":153,"name":"Dr. WILMA COTTO","address":"CARIMED PLAZA","city":"BAYAMON","zip":"00961","specialty":"GI"},{"id":154,"name":"Dr. CAROLINA DIAZ LOZA","address":"1420 AMERICO SALAS","city":"SAN JUAN","zip":"00909","specialty":"GI"},{"id":155,"name":"Dr. ALIANA BOFILL GARCIA","address":"ARTERIAL HOSTOS AVE SOUTH TOWER 239","city":"SAN JUAN","zip":"00918","specialty":"GI"},{"id":156,"name":"Dr. VICTOR TORRES ORTIZ","address":"TORRE MEDICA SAN LUCAS","city":"PONCE","zip":"00716","specialty":"GI"},{"id":157,"name":"Dr. ROBERT SOJO","address":"CARR.PR #2 K.M 43.0 BARRIO ALGARROBO","city":"VEGA BAJA","zip":"00687","specialty":"GI"},{"id":158,"name":"Dr. JORGE MELENDEZ","address":"CARR.PR #2 K.M 43.0 BARRIO ALGARROBO","city":"VEGA BAJA","zip":"00687","specialty":"GI"},{"id":159,"name":"Dr. KARLA RUIZ-VEGA","address":"435 AVE PONCE DE LEON 3RD FLOOR","city":"SAN JUAN","zip":"00917","specialty":"CRS"}];

const SETUP_SQL = `CREATE TABLE rep_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  rep_name text NOT NULL,
  visit_date date NOT NULL,
  provider_id integer NOT NULL,
  provider_name text NOT NULL,
  provider_city text,
  provider_specialty text,
  call_type text NOT NULL,
  products_discussed text[],
  outcome text NOT NULL,
  next_steps text,
  notes text,
  samples_left boolean DEFAULT false,
  literature_left boolean DEFAULT false
);
ALTER TABLE rep_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON rep_activities FOR ALL USING (true) WITH CHECK (true);`;

const DEMO = [
  {id:1,visit_date:"2025-04-18",rep_name:"Laura",provider_name:"Dr. MELVYN ACOSTA FEBO",provider_city:"SAN JUAN",provider_specialty:"GI",call_type:"Office Visit",products_discussed:["Xifaxan"],outcome:"Rx Commitment",notes:"Strong interest in IBS-D indication",samples_left:true,literature_left:true},
  {id:2,visit_date:"2025-04-18",rep_name:"Miguel",provider_name:"Dr. JOSE TORRES VEGA",provider_city:"PONCE",provider_specialty:"GI",call_type:"Lunch & Learn",products_discussed:["Linzess","Trulance"],outcome:"Formulary Discussion",notes:"Requested patient co-pay cards",samples_left:false,literature_left:true},
  {id:3,visit_date:"2025-04-17",rep_name:"David",provider_name:"Dr. VICTOR TORRES ORTIZ",provider_city:"PONCE",provider_specialty:"GI",call_type:"Hospital Round",products_discussed:["Motegrity"],outcome:"Scheduled Follow-up",notes:"Prefers morning appointments",samples_left:true,literature_left:false},
  {id:4,visit_date:"2025-04-16",rep_name:"Laura",provider_name:"Dr. RAFAEL TIRADO MONTIJO",provider_city:"MANATI",provider_specialty:"GI",call_type:"Office Visit",products_discussed:["Xifaxan"],outcome:"Needs More Info",notes:"Asked for clinical data",samples_left:false,literature_left:true},
  {id:5,visit_date:"2025-04-15",rep_name:"Miguel",provider_name:"Dr. KARLA AMARAL",provider_city:"CAGUAS",provider_specialty:"GI",call_type:"Office Visit",products_discussed:["Carafate"],outcome:"Sample / Literature Drop",notes:"",samples_left:true,literature_left:true},
  {id:6,visit_date:"2025-04-15",rep_name:"David",provider_name:"Dr. JEFFREY HERNANDEZ RODRIGUEZ",provider_city:"CAYEY",provider_specialty:"GI",call_type:"Office Visit",products_discussed:["Suprep"],outcome:"Rx Commitment",notes:"Switching from competitor",samples_left:false,literature_left:false},
];

const tc = s => s.replace(/\w\S*/g, t => t[0].toUpperCase()+t.slice(1).toLowerCase());
const pad2 = n => n<10?"0"+n:n;
const todayStr = () => { const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; };
const groupBy = (arr,key) => arr.reduce((a,x)=>{ const k=x[key]||"—"; a[k]=(a[k]||0)+1; return a; },{});

function ProviderSearch({ value, onChange }) {
  const [q,setQ] = useState(value ? tc(value.name) : "");
  const [open,setOpen] = useState(false);
  const [hi,setHi] = useState(0);
  const ref = useRef();
  const hits = q.length<2 ? [] : PROVIDERS.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.city.toLowerCase().includes(q.toLowerCase())).slice(0,8);
  useEffect(() => { const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",fn); return()=>document.removeEventListener("mousedown",fn); },[]);
  const pick = p => { onChange(p); setQ(tc(p.name)); setOpen(false); };
  const SC = { GI:{bg:B.sky,c:B.blue}, CRS:{bg:B.lime,c:B.green}, CRC:{bg:"#fef3c7",c:B.orange} };
  return (
    <div ref={ref} style={{position:"relative"}}>
      <input value={q} placeholder="Type name or city to search 159 providers…"
        onChange={e=>{setQ(e.target.value);setOpen(true);onChange(null);}}
        onFocus={()=>q.length>=2&&setOpen(true)}
        onKeyDown={e=>{if(e.key==="ArrowDown")setHi(h=>Math.min(h+1,hits.length-1));if(e.key==="ArrowUp")setHi(h=>Math.max(h-1,0));if(e.key==="Enter"&&hits[hi])pick(hits[hi]);if(e.key==="Escape")setOpen(false);}}
        style={{width:"100%",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem",padding:"11px 14px",border:`1.5px solid ${open?B.blue:B.border}`,borderRadius:8,outline:"none",color:B.dark,background:"#fff",boxShadow:open?`0 0 0 3px rgba(8,114,199,0.1)`:"none",transition:"all 0.2s"}}
      />
      {open && hits.length>0 && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#fff",border:`1px solid ${B.border}`,borderRadius:10,boxShadow:"0 8px 24px rgba(36,82,147,0.12)",zIndex:999,overflow:"hidden",maxHeight:320,overflowY:"auto"}}>
          {hits.map((p,i)=>(
            <div key={p.id} onMouseDown={()=>pick(p)} onMouseEnter={()=>setHi(i)}
              style={{padding:"10px 14px",cursor:"pointer",background:i===hi?B.light:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,borderBottom:`1px solid ${B.border}`}}>
              <div>
                <div style={{fontSize:"0.85rem",fontWeight:600,color:B.dark,fontFamily:"Montserrat,sans-serif"}}>{tc(p.name)}</div>
                <div style={{fontSize:"0.72rem",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>{p.address} · {p.city}</div>
              </div>
              <span style={{flexShrink:0,padding:"2px 9px",borderRadius:20,background:(SC[p.specialty]||SC.GI).bg,color:(SC[p.specialty]||SC.GI).c,fontSize:"0.68rem",fontWeight:700,fontFamily:"Montserrat,sans-serif"}}>{p.specialty}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SetupModal({onClose}) {
  const [copied,setCopied]=useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(26,42,58,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:16,padding:"2rem",maxWidth:660,width:"90%",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 48px rgba(36,82,147,0.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 style={{fontFamily:"Montserrat,sans-serif",fontWeight:800,color:B.dark,fontSize:"1.15rem",margin:0}}>⚙ Supabase Setup Guide</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.4rem",color:B.mid,cursor:"pointer"}}>×</button>
        </div>
        <ol style={{fontFamily:"Montserrat,sans-serif",color:B.mid,lineHeight:2.1,paddingLeft:"1.4rem",fontSize:"0.86rem"}}>
          <li>Go to <a href="https://supabase.com" target="_blank" style={{color:B.blue,fontWeight:700}}>supabase.com</a> → create free account & new project</li>
          <li>Open <strong style={{color:B.dark}}>SQL Editor</strong> → paste SQL below → click Run</li>
          <li>Go to <strong style={{color:B.dark}}>Project Settings → API</strong> → copy <em>Project URL</em> and <em>anon public key</em></li>
          <li>Replace <code style={{background:B.light,padding:"2px 6px",borderRadius:4,color:B.dkOrange}}>SUPABASE_URL</code> and <code style={{background:B.light,padding:"2px 6px",borderRadius:4,color:B.dkOrange}}>SUPABASE_ANON_KEY</code> at top of file</li>
          <li>Host on <a href="https://vercel.com" target="_blank" style={{color:B.blue,fontWeight:700}}>Vercel</a> (free) — share URL with Laura, Miguel & David</li>
        </ol>
        <div style={{position:"relative",marginTop:"1rem"}}>
          <pre style={{background:B.light,border:`1px solid ${B.border}`,borderRadius:10,padding:"1rem",fontSize:"0.73rem",color:B.navy,overflowX:"auto",fontFamily:"monospace",whiteSpace:"pre"}}>{SETUP_SQL}</pre>
          <button onClick={()=>{navigator.clipboard.writeText(SETUP_SQL);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            style={{position:"absolute",top:10,right:10,background:copied?B.green:B.navy,border:"none",borderRadius:6,color:"#fff",padding:"4px 12px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"Montserrat,sans-serif",fontWeight:700,transition:"background 0.2s"}}>
            {copied?"Copied!":"Copy SQL"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({label,val,sub,color,icon}) {
  return (
    <div style={{background:"#fff",border:`1px solid ${B.border}`,borderRadius:14,padding:"1.25rem 1.5rem",borderTop:`3px solid ${color}`,transition:"box-shadow 0.2s",cursor:"default"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(36,82,147,0.1)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:"0.66rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:B.mid,fontFamily:"Montserrat,sans-serif",marginBottom:8}}>{label}</div>
          <div style={{fontSize:"2rem",fontWeight:800,color,fontFamily:"Montserrat,sans-serif",lineHeight:1}}>{val}</div>
          {sub&&<div style={{fontSize:"0.73rem",color:B.mid,fontFamily:"Montserrat,sans-serif",marginTop:6}}>{sub}</div>}
        </div>
        <span style={{fontSize:"1.5rem",opacity:0.18}}>{icon}</span>
      </div>
    </div>
  );
}

function MiniBar({data,color,label}) {
  const sorted = Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const max = Math.max(...sorted.map(([,v])=>v),1);
  return (
    <div style={{background:"#fff",border:`1px solid ${B.border}`,borderRadius:14,padding:"1.25rem 1.5rem"}}>
      <div style={{fontSize:"0.66rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:B.mid,fontFamily:"Montserrat,sans-serif",marginBottom:14}}>{label}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {sorted.map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{width:130,fontSize:"0.75rem",color:B.dark,fontFamily:"Montserrat,sans-serif",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{k}</span>
            <div style={{flex:1,background:B.light,borderRadius:4,height:7}}><div style={{width:`${(v/max)*100}%`,height:"100%",background:color,borderRadius:4,transition:"width 0.5s ease"}}/></div>
            <span style={{width:18,textAlign:"right",fontSize:"0.78rem",fontWeight:700,color,fontFamily:"Montserrat,sans-serif"}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({a,i}) {
  const oc = OC[a.outcome]||B.mid;
  const rc = REP_COLORS[a.rep_name]||B.navy;
  return (
    <div style={{display:"grid",gridTemplateColumns:"82px 28px 1fr 110px 80px 140px",gap:10,padding:"0.8rem 1.25rem",borderBottom:`1px solid ${B.light}`,alignItems:"center",background:i%2===0?"#fff":"#fafcff",transition:"background 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=B.sky+"44"}
      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafcff"}>
      <span style={{color:B.mid,fontSize:"0.7rem",fontFamily:"Montserrat,sans-serif"}}>{a.visit_date}</span>
      <div style={{width:24,height:24,borderRadius:"50%",background:rc,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.65rem",fontWeight:800,fontFamily:"Montserrat,sans-serif",flexShrink:0}}>{a.rep_name?.[0]}</div>
      <div>
        <div style={{fontSize:"0.82rem",fontWeight:600,color:B.dark,fontFamily:"Montserrat,sans-serif"}}>{tc(a.provider_name||"")}</div>
        <div style={{fontSize:"0.7rem",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>{a.provider_city} · {a.call_type}</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
        {(a.products_discussed||[]).map(p=>(
          <span key={p} style={{padding:"1px 6px",background:B.lime,color:"#2d4a10",borderRadius:10,fontSize:"0.6rem",fontWeight:700,fontFamily:"Montserrat,sans-serif"}}>{p}</span>
        ))}
      </div>
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        {a.samples_left&&<span title="Samples" style={{fontSize:"0.75rem"}}>💊</span>}
        {a.literature_left&&<span title="Literature" style={{fontSize:"0.75rem"}}>📄</span>}
      </div>
      <span style={{padding:"3px 10px",borderRadius:20,background:oc+"1a",color:oc,fontSize:"0.67rem",fontWeight:700,fontFamily:"Montserrat,sans-serif",textAlign:"center",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.outcome}</span>
    </div>
  );
}

export default function App() {
  const [view,setView]=useState("dashboard");
  const [acts,setActs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [showSetup,setShowSetup]=useState(false);
  const [rep,setRep]=useState("All");
  const [toast,setToast]=useState("");
  const [demo,setDemo]=useState(false);
  const isOk = !SUPABASE_URL.includes("YOUR_PROJECT");
  const blank={rep_name:REPS[0],visit_date:todayStr(),provider:null,call_type:CALL_TYPES[0],products:[],outcome:OUTCOMES[0],next_steps:"",notes:"",samples_left:false,literature_left:false};
  const [form,setForm]=useState(blank);

  useEffect(()=>{load();},[]);
  async function load(){
    setLoading(true);
    if(!isOk){setActs(DEMO);setDemo(true);setLoading(false);return;}
    try{const d=await sb.select("rep_activities");setActs(Array.isArray(d)?d:DEMO);if(!Array.isArray(d))setDemo(true);}
    catch{setActs(DEMO);setDemo(true);}
    setLoading(false);
  }
  function notify(msg){setToast(msg);setTimeout(()=>setToast(""),3000);}
  async function submit(){
    if(!form.provider){notify("⚠ Select a provider first");return;}
    if(!isOk){notify("⚠ Connect Supabase first to save");return;}
    setSaving(true);
    await sb.insert("rep_activities",{rep_name:form.rep_name,visit_date:form.visit_date,provider_id:form.provider.id,provider_name:form.provider.name,provider_city:form.provider.city,provider_specialty:form.provider.specialty,call_type:form.call_type,products_discussed:form.products,outcome:form.outcome,next_steps:form.next_steps,notes:form.notes,samples_left:form.samples_left,literature_left:form.literature_left});
    notify("✓ Activity logged!");
    setForm(blank);
    await load();
    setView("dashboard");
    setSaving(false);
  }

  const fil = rep==="All"?acts:acts.filter(a=>a.rep_name===rep);
  const week = acts.filter(a=>(new Date()-new Date(a.visit_date))/86400000<=7);
  const cities = new Set(acts.map(a=>a.provider_city).filter(Boolean));
  const rxCount = acts.filter(a=>a.outcome==="Rx Commitment").length;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:${B.light};font-family:Montserrat,sans-serif;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pop{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px}`}</style>

      {showSetup&&<SetupModal onClose={()=>setShowSetup(false)}/>}
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:3000,background:toast.startsWith("✓")?B.green:B.dkOrange,color:"#fff",padding:"10px 20px",borderRadius:10,fontFamily:"Montserrat,sans-serif",fontWeight:700,fontSize:"0.83rem",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",animation:"pop 0.3s ease"}}>{toast}</div>}

      {/* NAVBAR */}
      <div style={{background:"#fff",borderBottom:`1px solid ${B.border}`,position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(36,82,147,0.06)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:70}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <svg viewBox="0 0 260 56" height="40">
              <rect x="0" y="6" width="9" height="44" rx="2.5" fill={B.green}/>
              <rect x="12" y="6" width="9" height="44" rx="2.5" fill={B.blue}/>
              <rect x="24" y="6" width="9" height="44" rx="2.5" fill={B.orange}/>
              <text x="40" y="38" fontFamily="Montserrat,sans-serif" fontWeight="800" fontSize="22" fill={B.navy}>PHARMA</text>
              <text x="154" y="38" fontFamily="Montserrat,sans-serif" fontWeight="400" fontSize="22" fill={B.green}>new</text>
            </svg>
            <div style={{width:1,height:28,background:B.border}}/>
            <span style={{fontSize:"0.68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:B.mid}}>Field Activity</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {demo&&<span style={{fontSize:"0.65rem",fontWeight:700,color:B.orange,background:B.orange+"18",border:`1px solid ${B.orange}44`,borderRadius:20,padding:"3px 10px"}}>DEMO MODE</span>}
            <button onClick={()=>setShowSetup(true)} style={{background:"none",border:`1px solid ${B.border}`,borderRadius:8,color:B.mid,padding:"7px 14px",cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:"0.74rem",fontWeight:600,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=B.blue;e.currentTarget.style.color=B.blue}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=B.border;e.currentTarget.style.color=B.mid}}>⚙ Setup</button>
            {["dashboard","log"].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"8px 18px",borderRadius:8,border:`1.5px solid ${view===v?B.blue:B.border}`,background:view===v?B.blue:"#fff",color:view===v?"#fff":B.mid,fontFamily:"Montserrat,sans-serif",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
                {v==="dashboard"?"📊 Dashboard":"＋ Log Activity"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"2rem"}}>

        {/* DASHBOARD */}
        {view==="dashboard"&&(
          <div style={{animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:"1.5rem"}}>
              <KPI label="Total Calls" val={acts.length} sub="All time" color={B.navy} icon="📋"/>
              <KPI label="This Week" val={week.length} sub="Last 7 days" color={B.blue} icon="📅"/>
              <KPI label="Cities Covered" val={cities.size} sub="Unique locations" color={B.green} icon="📍"/>
              <KPI label="Rx Commitments" val={rxCount} sub="All time" color={B.dkOrange} icon="💊"/>
            </div>

            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:"1.5rem",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid}}>Filter:</span>
              {["All",...REPS].map(r=>{
                const a=rep===r; const c=r==="All"?B.navy:(REP_COLORS[r]||B.navy);
                return <button key={r} onClick={()=>setRep(r)} style={{padding:"5px 16px",borderRadius:20,border:`1.5px solid ${a?c:B.border}`,background:a?c:"#fff",color:a?"#fff":B.mid,fontFamily:"Montserrat,sans-serif",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{r}</button>;
              })}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:"1.5rem"}}>
              <MiniBar data={groupBy(fil,"provider_city")} color={B.blue} label="Calls by City"/>
              <MiniBar data={groupBy(fil,"rep_name")} color={B.green} label="Calls by Rep"/>
              <MiniBar data={groupBy(fil,"outcome")} color={B.dkOrange} label="Outcomes"/>
              <MiniBar data={groupBy(fil,"call_type")} color={B.navy} label="Call Types"/>
            </div>

            <div style={{background:"#fff",border:`1px solid ${B.border}`,borderRadius:14,overflow:"hidden"}}>
              <div style={{padding:"1rem 1.25rem",borderBottom:`1px solid ${B.light}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:800,fontSize:"0.95rem",color:B.dark,fontFamily:"Montserrat,sans-serif"}}>Recent Activity Log</span>
                <span style={{fontSize:"0.7rem",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>{fil.length} entries</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"82px 28px 1fr 110px 80px 140px",gap:10,padding:"0.55rem 1.25rem",borderBottom:`1px solid ${B.light}`,background:B.light}}>
                {["Date","","Provider / Location","Products","Material","Outcome"].map(h=>(
                  <span key={h} style={{fontSize:"0.62rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>{h}</span>
                ))}
              </div>
              {loading?<div style={{padding:"2.5rem",textAlign:"center",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>Loading…</div>
              :fil.length===0?<div style={{padding:"3rem",textAlign:"center",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>No activities yet. Hit <strong>Log Activity</strong> to start.</div>
              :fil.slice(0,30).map((a,i)=><Row key={a.id} a={a} i={i}/>)}
            </div>
          </div>
        )}

        {/* LOG FORM */}
        {view==="log"&&(
          <div style={{maxWidth:640,margin:"0 auto",animation:"fadeUp 0.35s ease"}}>
            <div style={{background:"#fff",border:`1px solid ${B.border}`,borderRadius:16,padding:"2rem",boxShadow:"0 4px 20px rgba(36,82,147,0.07)"}}>
              <div style={{borderLeft:`4px solid ${B.green}`,paddingLeft:14,marginBottom:"1.75rem"}}>
                <h2 style={{fontFamily:"Montserrat,sans-serif",fontWeight:800,fontSize:"1.25rem",color:B.dark,marginBottom:3}}>Log Field Activity</h2>
                <p style={{color:B.mid,fontSize:"0.8rem",fontFamily:"Montserrat,sans-serif"}}>Record a provider visit or engagement</p>
              </div>

              {/* REP + DATE */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div>
                  <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Rep *</label>
                  <div style={{display:"flex",gap:6}}>
                    {REPS.map(r=>{const sel=form.rep_name===r;const c=REP_COLORS[r];return(
                      <button key={r} onClick={()=>setForm(f=>({...f,rep_name:r}))} style={{flex:1,padding:"9px 4px",borderRadius:8,border:`1.5px solid ${sel?c:B.border}`,background:sel?c:"#fff",color:sel?"#fff":B.mid,fontFamily:"Montserrat,sans-serif",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>{r}</button>
                    );})}
                  </div>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Visit Date *</label>
                  <input type="date" value={form.visit_date} onChange={e=>setForm(f=>({...f,visit_date:e.target.value}))} style={{width:"100%",fontFamily:"Montserrat,sans-serif",fontSize:"0.88rem",padding:"10px 14px",border:`1.5px solid ${B.border}`,borderRadius:8,outline:"none",color:B.dark,background:"#fff"}}/>
                </div>
              </div>

              {/* PROVIDER */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Provider * <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:"0.7rem",color:B.mid}}>(search 159 providers by name or city)</span></label>
                <ProviderSearch value={form.provider} onChange={p=>setForm(f=>({...f,provider:p}))}/>
                {form.provider&&(
                  <div style={{marginTop:8,padding:"10px 14px",background:B.sky,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div>
                      <div style={{fontSize:"0.83rem",fontWeight:700,color:B.navy,fontFamily:"Montserrat,sans-serif"}}>{tc(form.provider.name)}</div>
                      <div style={{fontSize:"0.71rem",color:B.mid,fontFamily:"Montserrat,sans-serif"}}>{form.provider.address} · {form.provider.city}, PR {form.provider.zip}</div>
                    </div>
                    <span style={{padding:"3px 10px",borderRadius:20,background:form.provider.specialty==="GI"?B.blue+"18":form.provider.specialty==="CRS"?B.green+"18":"#fef3c7",color:form.provider.specialty==="GI"?B.blue:form.provider.specialty==="CRS"?B.green:B.orange,fontSize:"0.7rem",fontWeight:700,fontFamily:"Montserrat,sans-serif",flexShrink:0}}>{form.provider.specialty}</span>
                  </div>
                )}
              </div>

              {/* CALL TYPE */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Call Type *</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {CALL_TYPES.map(t=>{const sel=form.call_type===t;return(
                    <button key={t} onClick={()=>setForm(f=>({...f,call_type:t}))} style={{padding:"7px 13px",borderRadius:8,border:`1.5px solid ${sel?B.navy:B.border}`,background:sel?B.navy:"#fff",color:sel?"#fff":B.mid,fontFamily:"Montserrat,sans-serif",fontSize:"0.77rem",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{t}</button>
                  );})}
                </div>
              </div>

              {/* PRODUCTS */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Products Discussed</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {PRODUCTS.map(p=>{const sel=form.products.includes(p);return(
                    <button key={p} onClick={()=>setForm(f=>({...f,products:sel?f.products.filter(x=>x!==p):[...f.products,p]}))} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${sel?B.green:B.border}`,background:sel?B.green:"#fff",color:sel?"#fff":B.mid,fontFamily:"Montserrat,sans-serif",fontSize:"0.77rem",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{p}</button>
                  );})}
                </div>
              </div>

              {/* OUTCOME */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Outcome *</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {OUTCOMES.map(o=>{const oc=OC[o]||B.mid;const sel=form.outcome===o;return(
                    <button key={o} onClick={()=>setForm(f=>({...f,outcome:o}))} style={{padding:"7px 13px",borderRadius:8,border:`1.5px solid ${sel?oc:B.border}`,background:sel?oc+"1a":"#fff",color:sel?oc:B.mid,fontFamily:"Montserrat,sans-serif",fontSize:"0.77rem",fontWeight:sel?700:500,cursor:"pointer",transition:"all 0.2s"}}>{o}</button>
                  );})}
                </div>
              </div>

              {/* CHECKBOXES */}
              <div style={{marginBottom:16,display:"flex",gap:24}}>
                {[["samples_left","💊 Samples Left"],["literature_left","📄 Literature Left"]].map(([k,lbl])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <input type="checkbox" checked={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))} style={{width:16,height:16,accentColor:B.green,cursor:"pointer"}}/>
                    <span style={{fontSize:"0.82rem",fontWeight:600,color:B.dark,fontFamily:"Montserrat,sans-serif"}}>{lbl}</span>
                  </label>
                ))}
              </div>

              {/* NEXT STEPS */}
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Next Steps</label>
                <input type="text" placeholder="e.g. Send follow-up with patient data on Monday…" value={form.next_steps} onChange={e=>setForm(f=>({...f,next_steps:e.target.value}))} style={{width:"100%",fontFamily:"Montserrat,sans-serif",fontSize:"0.86rem",padding:"10px 14px",border:`1.5px solid ${B.border}`,borderRadius:8,outline:"none",color:B.dark,background:"#fff"}}/>
              </div>

              {/* NOTES */}
              <div style={{marginBottom:20}}>
                <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:B.mid,marginBottom:8,fontFamily:"Montserrat,sans-serif"}}>Notes</label>
                <textarea rows={3} placeholder="Objections, context, what resonated…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{width:"100%",fontFamily:"Montserrat,sans-serif",fontSize:"0.86rem",padding:"10px 14px",border:`1.5px solid ${B.border}`,borderRadius:8,outline:"none",color:B.dark,background:"#fff",resize:"vertical"}}/>
              </div>

              <button onClick={submit} disabled={saving||!form.provider} style={{width:"100%",padding:"0.9rem",borderRadius:10,border:"none",background:saving||!form.provider?"#c8d8e8":B.green,color:"#fff",fontFamily:"Montserrat,sans-serif",fontWeight:800,fontSize:"0.9rem",cursor:saving||!form.provider?"not-allowed":"pointer",transition:"background 0.2s",letterSpacing:"0.02em"}}>
                {saving?"Saving…":"✓ Log This Activity"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
