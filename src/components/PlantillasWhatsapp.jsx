// components/PlantillasWhatsApp.jsx
import React, { useState } from "react";

const PlantillasWhatsApp = () => {
  const [tipoPlantilla, setTipoPlantilla] = useState("sin-descuento");
  const [categoria, setCategoria] = useState("mensaje-automatico");
  const [textoCopiado, setTextoCopiado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const plantillas = {
    "sin-descuento": {
      titulo: "Plantillas SIN DESCUENTO",
      mensajes: {
        "mensaje-automatico": {
          label: "Mensaje automático",
          opciones: [
            "Hola, buen día. Gracias por comunicarte a ASECON en representación de AT&T México. En un momento te atendemos.",
            "Nuestros ejecutivos se encuentran ocupados, en un momento te atendemos.",
          ],
        },
        "agente-saludo": {
          label: "Agente - Saludo",
          opciones: [
            "Hola, buen día. Gracias por comunicarte a ASECON en Representación de AT&T México, te atiende Xxxxxxxxxx Xxxxxxxxxx. ¿Cómo puedo apoyarte?",
          ],
        },
        "agente-requerimiento": {
          label: "Agente - Requerimiento",
          opciones: [
            "Me puedes indicar ¿Qué tipo de requerimiento recibiste? Correo, sms o llamada.",
          ],
        },
        "agente-datos": {
          label: "Agente - Solicitar datos",
          opciones: [
            "Por favor, me puedes indicar tu nombre completo para brindarte más información de tu contrato.",
            "En el correo que recibiste, en la parte superior izquierda se encuentra tu número de clave o bien en la parte central del correo tu número de cuenta ¿me puedes proporcionar alguno de estos datos? por favor.",
          ],
        },
        "agente-adeudo": {
          label: "Agente - Adeudo",
          opciones: [
            'Con la información que me proporcionas se tiene un adeudo por $0.00 que corresponde a "X" facturas vencidas, referente a la línea telefónica con terminación (xx xx)',
          ],
        },
        "agente-motivo": {
          label: "Agente - Motivo falta de pago",
          opciones: [
            "¿Cuál es el motivo de la falta de pago?",
            "¿A qué se debe la falta de pago?",
          ],
        },
        "agente-solucion": {
          label: "Agente - Solución",
          opciones: [
            "Lamento la situación que nos compartes, me gustaría poder brindarte alguna posible solución para el adeudo que se encuentra pendiente.",
          ],
        },
        "convenio-2-parcialidades": {
          label: "Convenio 2 parcialidades",
          opciones: [
            "Convenio en 2 parcialidades sobre su saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactivara tu servicio.",
          ],
        },
        "convenio-3-parcialidades": {
          label: "Convenio 3 parcialidades",
          opciones: [
            "Convenio en 3 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $500.00\n3er pago | 08 de septiembre por $500.00\n\nNOTA: Una vez que realices tu 1er pago, se reactivara tu servicio.",
          ],
        },
        "convenio-4-parcialidades": {
          label: "Convenio 4 parcialidades",
          opciones: [
            "Convenio en 4 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $500.00\n2do pago | 01 de septiembre por $500.00\n3er pago | 08 de septiembre por $500.00\n4to pago | 15 de septiembre por $500.00\n\nNOTA: Una vez que realices tu 2do pago, se reactiva tu servicio.",
          ],
        },
        "agente-pregunta-pago": {
          label: "Agente - Pregunta pago",
          opciones: [
            "De las opciones que te brinde ¿Cuál es la que se adapta a tus posibilidades?",
          ],
        },
        "agente-confirmacion": {
          label: "Agente - Confirmación",
          opciones: [
            "Entonces, ¿Contamos con tu pago el día de hoy?",
            "Entonces, ¿Contamos con tu primera parcialidad el día de hoy?",
          ],
        },
        "agente-factura": {
          label: "Agente - Factura en curso",
          opciones: [
            "Es importante que consideres tu factura del mes en curso, por la cantidad de $0.00 con fecha límite de pago el día dd/mm.",
          ],
        },
        "agente-medios-pago": {
          label: "Agente - Medios de pago",
          opciones: [
            "Si cuentas con alguna tarjeta de crédito o débito, puedes realizar tu pago con cargo en línea, marcando desde tu teléfono celular *PAGO (*7246) o bien a través de las siguientes opciones:\n\n• App Mi ATT\n• Portales Bancarios\n\nPara pago en efectivo lo puedes realizar en: Tienda AT&T, 7 Eleven, Elektra, Farmacias del Ahorro, Farmacias Benavides con su línea a 10 dígitos (pago de servicios).",
          ],
        },
        "agente-reporte-pago": {
          label: "Agente - Reporte de pago",
          opciones: [
            "Una vez realizado el pago, te pedimos ponerte en contacto con nosotros a los siguientes números telefónicos:\n\n5544453016 / 5544453023 / 8007003017 / 8007773025\n\nde lunes a viernes de 07:00 a.m. a 09:00 p.m., sábados de 08:00 a.m. a 02:30 p.m. y domingos de 08:00 a.m. a 02:00 p.m. para reportar tu pago, continuar con el acuerdo generado y realizar la activación de tu servicio en un periodo máximo de 24hrs.",
          ],
        },
        "agente-importancia": {
          label: "Agente - Importancia del acuerdo",
          opciones: [
            "Es muy importante el cumplimiento del acuerdo que estamos generando con la finalidad de evitar que continúen los accionamientos por parte del área de Cobranza y no verse afectado en su reporte de buró de crédito.",
          ],
        },
        "agente-privacidad": {
          label: "Agente - Aviso de privacidad",
          opciones: [
            "Le recuerdo que sus datos están protegidos por la ley federal de protección de datos y puede consultar el aviso de privacidad en www.att.com.mx",
          ],
        },
        "agente-despedida": {
          label: "Agente - Despedida",
          opciones: [
            "¿Alguna duda?",
            "Gracias por comunicarse a ASECON en representación de AT&T México.",
            "Le deseamos que tenga un excelente día.",
            "Le deseamos que tenga una excelente tarde.",
            "Le deseamos que tenga una excelente noche.",
          ],
        },
        "otros-retomar": {
          label: "OTROS - Retomar llamada",
          opciones: [
            "Sigo atendiéndole",
            "¿Tiene alguna duda con la información proporcionada?",
          ],
        },
        "otros-no-acepta": {
          label: "OTROS - Cliente no acepta",
          opciones: [
            "Lamento que las opciones que le brinde no se adapten a tus posibilidades. Cualquier duda o situación nos puedes contactar de lunes a viernes de 07:00 a.m. a 09:00 p.m., sábados de 08:00 a.m. a 02:30 p.m. y domingos de 08:00 a.m. a 02:00 p.m. en los siguientes números:\n\n5544453016 / 5544453023 / 8007003017 / 8007773025.",
          ],
        },
        "otros-informacion": {
          label: "OTROS - Información cliente",
          opciones: [
            "Por este medio no puedo visualizar imágenes, por favor me puedes compartir tu comprobante al correo serviciosatt@asecon2006.com.mx",
            "Por este medio no puedo ver las imágenes o escuchar audios, me puedes enviar tus comentarios en texto, por favor.",
          ],
        },
        "otros-cuenta-no-asignada": {
          label: "OTROS - Cuenta no asignada",
          opciones: [
            "Tu cuenta ya no se encuentra con nosotros, es necesario que te comuniques al número 8000511000 para que te brinden más información.",
          ],
        },
        cancelados: {
          label: "CANCELADOS",
          opciones: [
            "Te informo que tu cuenta se encuentra cancelada con un saldo al día de hoy por $0.00, una vez que hayas realizado el pago correspondiente se actualizara tu reporte de buró de crédito y puedes tramitar tu carta finiquito.",
            "Una vez generado tu pago, es necesario que te comuniques con AT&T al 8000511000 para solicitar tu carta finiquito, misma que te llegará a tu correo electrónico en un lapso no mayor a 10 días hábiles.",
          ],
        },
      },
    },
    bonificacion: {
      titulo: "Plantillas CON DESCUENTO DE GASTOS DE COBRANZA",
      mensajes: {
        "mensaje-automatico": {
          label: "Mensaje automático",
          opciones: [
            "Hola, buen día. Gracias por comunicarte a ASECON en representación de AT&T México. En un momento te atendemos.",
            "Nuestros ejecutivos se encuentran ocupados, en un momento te atendemos.",
          ],
        },
        "agente-saludo": {
          label: "Agente - Saludo",
          opciones: [
            "Hola, buen día. Gracias por comunicarte a ASECON en representación de AT&T México, te atiende Xxxxxxxxxx Xxxxxxxxxx. ¿Cómo puedo apoyarte?",
          ],
        },
        "agente-requerimiento": {
          label: "Agente - Requerimiento",
          opciones: [
            "Me puedes indicar ¿Qué tipo de requerimiento recibiste? Correo, sms o llamada.",
          ],
        },
        "agente-datos": {
          label: "Agente - Solicitar datos",
          opciones: [
            "Por favor, me puedes indicar tu nombre completo para brindarte más información de tu contrato.",
            "En el correo que recibiste, en la parte superior izquierda se encuentra tu número de clave o bien en la parte central del correo tu número de cuenta ¿me puedes proporcionar alguno de estos datos? por favor.",
          ],
        },
        "agente-adeudo": {
          label: "Agente - Adeudo",
          opciones: [
            'Con la información que me proporcionas se tiene un adeudo por $0.00 que corresponde a "X" facturas vencidas, referente a la línea telefónica con terminación (xx xx)',
          ],
        },
        "agente-motivo": {
          label: "Agente - Motivo falta de pago",
          opciones: [
            "¿Cuál es el motivo de la falta de pago?",
            "¿A qué se debe la falta de pago?",
          ],
        },
        "agente-solucion": {
          label: "Agente - Solución",
          opciones: [
            "Lamento la situación que nos compartes, me gustaría poder brindarte alguna posible solución para el adeudo que se encuentra pendiente.",
          ],
        },
        "descuento-1-cargo": {
          label: "Descuento 1 cargo cobranza",
          opciones: [
            "EL DÍA DE HOY tienes un DESCUENTO de 1 Cargo por gasto de cobranza sobre tu saldo vencido y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; te puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realice el 1er pago, se reactiva su servicio.",
          ],
        },
        "descuento-2-cargos": {
          label: "Descuento 2 cargos cobranza",
          opciones: [
            "EL DÍA DE HOY tienes un DESCUENTO de 2 Cargos por gastos de cobranza sobre tu saldo vencido y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; te puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactiva tu servicio.",
          ],
        },
        "descuento-3-cargos": {
          label: "Descuento 3 cargos cobranza",
          opciones: [
            "EL DÍA DE HOY tienes un DESCUENTO de 3 Cargos por gastos de cobranza sobre tu saldo vencido y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; le puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactiva tu servicio.",
          ],
        },
        "descuento-bk1": {
          label: "BONI ESPECIAL BK1",
          opciones: [
            "EL DÍA DE HOY tienes un DESCUENTO de 1 Cargo por gasto de cobranza sobre tu saldo total y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; te puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactiva tu servicio.",
          ],
        },
        "agente-pregunta-pago": {
          label: "Agente - Pregunta pago",
          opciones: [
            "De las opciones brindadas ¿Cuál es la que se adapta a tus posibilidades?",
          ],
        },
        "agente-confirmacion": {
          label: "Agente - Confirmación",
          opciones: [
            "Entonces, ¿Contamos con tu pago el día de hoy?",
            "Entonces, ¿Contamos con tu primera parcialidad el día de hoy?",
          ],
        },
        "agente-factura": {
          label: "Agente - Factura en curso",
          opciones: [
            "Es importante que consideres tu factura del mes en curso, por la cantidad de $0.00 con fecha límite de pago el día dd/mm.",
          ],
        },
        "agente-medios-pago": {
          label: "Agente - Medios de pago",
          opciones: [
            "Si cuentas con alguna tarjeta de crédito o débito puedes realizar tu pago con cargo en línea, marcando desde tu teléfono celular *PAGO (*7246) o bien a través de las siguientes opciones:\n\n• App Mi ATT\n• Portales Bancarios\n\nPara pago en efectivo lo puedes hacer en: Tienda AT&T, 7 Eleven, Elektra, Farmacias del Ahorro, Farmacias Benavides con su línea a 10 dígitos (pago de servicios).",
          ],
        },
        "agente-reporte-pago": {
          label: "Agente - Reporte de pago",
          opciones: [
            "Una vez realizado el pago, te pedimos ponerte en contacto con nosotros a los siguientes números telefónicos:\n\n5544453016 / 5544453023 / 8007003017 / 8007773025\n\nde lunes a viernes de 07:00 a.m. a 09:00 p.m., sábados de 08:00 a.m. a 02:30 p.m. y domingos de 08:00 a.m. a 02:00 p.m. para reportar tu pago, continuar con el acuerdo generado y realizar la activación de tu servicio en un periodo máximo de 24hrs.",
          ],
        },
        "agente-importancia": {
          label: "Agente - Importancia del acuerdo",
          opciones: [
            "Es muy importante el cumplimiento del acuerdo que estamos generando con la finalidad de evitar que continúen los accionamientos por parte del área de Cobranza y no verse afectado en su reporte de buró de crédito.",
          ],
        },
        "agente-privacidad": {
          label: "Agente - Aviso de privacidad",
          opciones: [
            "Le recuerdo que sus datos están protegidos por la ley federal de protección de datos y puede consultar el aviso de privacidad en www.att.com.mx",
          ],
        },
        "agente-despedida": {
          label: "Agente - Despedida",
          opciones: [
            "¿Alguna duda?",
            "Gracias por comunicarse a ASECON en representación de AT&T México.",
            "Le deseamos que tenga un excelente día.",
            "Le deseamos que tenga una excelente tarde.",
            "Le deseamos que tenga una excelente noche.",
          ],
        },
        "otros-retomar": {
          label: "OTROS - Retomar llamada",
          opciones: [
            "Sigo atendiéndole",
            "¿Tiene alguna duda con la información proporcionada?",
          ],
        },
        "otros-no-acepta": {
          label: "OTROS - Cliente no acepta",
          opciones: [
            "Lamento que las opciones que le brinde no se adapten a tus posibilidades. Cualquier duda o situación nos puedes contactar de lunes a viernes de 07:00 a.m. a 09:00 p.m., sábados de 08:00 a.m. a 02:30 p.m. y domingos de 08:00 a.m. a 02:00 p.m. en los siguientes números:\n\n5544453016 / 5544453023 / 8007003017 / 8007773025.",
          ],
        },
        "otros-informacion": {
          label: "OTROS - Información cliente",
          opciones: [
            "Por este medio no puedo visualizar imágenes, por favor me puedes compartir tu comprobante al correo serviciosatt@asecon2006.com.mx",
            "Por este medio no puedo ver las imágenes o escuchar audios, me puedes enviar tus comentarios en texto, por favor.",
          ],
        },
        "otros-cuenta-no-asignada": {
          label: "OTROS - Cuenta no asignada",
          opciones: [
            "Tu cuenta ya no se encuentra con nosotros, es necesario que te comuniques al número 8000511000 para que te brinden más información.",
          ],
        },
        cancelados: {
          label: "CANCELADOS",
          opciones: [
            "Te informo que tu cuenta se encuentra cancelada con un saldo al día de hoy por $0.00, una vez que hayas realizado el pago correspondiente se actualizara tu reporte de buró de crédito y puedes tramitar tu carta finiquito.\n\nUna vez generado tu pago, es necesario que te comuniques con AT&T al 8000511000 para solicitar tu carta finiquito, misma que te llegará a tu correo electrónico en un lapso no mayor a 10 días hábiles.",
          ],
        },
      },
    },
    descuento: {
      titulo: "Plantillas CON DESCUENTO",
      mensajes: {
        "mensaje-automatico": {
          label: "Mensaje automático",
          opciones: [
            "Hola, buen día. Gracias por comunicarte a ASECON en Representación de AT&T México. En un momento te atendemos.",
            "Nuestros ejecutivos se encuentran ocupados, en un momento te atendemos.",
          ],
        },
        "agente-saludo": {
          label: "Agente - Saludo",
          opciones: [
            "Hola, buen día. Gracias por comunicarte a ASECON en representación de AT&T México, te atiende Xxxxxxxxxx Xxxxxxxxxx. ¿Cómo puedo apoyarte?",
          ],
        },
        "agente-requerimiento": {
          label: "Agente - Requerimiento",
          opciones: [
            "Me puedes indicar ¿Qué tipo de requerimiento recibiste? Correo, sms o llamada.",
          ],
        },
        "agente-datos": {
          label: "Agente - Solicitar datos",
          opciones: [
            "Por favor, me puedes indicar tu nombre completo para brindarte más información de tu contrato.",
            "En el correo que recibiste, en la parte superior izquierda se encuentra tu número de clave o bien en la parte central del correo tu número de cuenta ¿me puedes proporcionar alguno de estos datos? por favor.",
          ],
        },
        "agente-adeudo": {
          label: "Agente - Adeudo",
          opciones: [
            'Con la información que me proporcionas se tiene un adeudo por $0.00 que corresponde a "X" facturas vencidas, referente a la línea telefónica con terminación (xx xx)',
          ],
        },
        "agente-motivo": {
          label: "Agente - Motivo falta de pago",
          opciones: [
            "¿Cuál es el motivo de la falta de pago?",
            "¿A qué se debe la falta de pago?",
          ],
        },
        "agente-solucion": {
          label: "Agente - Solución",
          opciones: [
            "Lamento la situación que nos compartes, me gustaría poder brindarte alguna posible solución para el adeudo que se encuentra pendiente.",
          ],
        },
        "descuento-opcion1": {
          label: "Descuento - Opción 1",
          opciones: [
            "EL DÍA DE HOY cuentas con un DESCUENTO sobre tu saldo vencido y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; te puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactiva tu servicio.",
          ],
        },
        "descuento-opcion2": {
          label: "Descuento - Opción 2 (45%)",
          opciones: [
            "EL DÍA DE HOY cuentas con un 45% de DESCUENTO sobre tu saldo vencido y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; te puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactiva tu servicio.",
          ],
        },
        "descuento-opcion3": {
          label: "Descuento - Opción 3",
          opciones: [
            "EL DÍA DE HOY cuenta con un DESCUENTO de $0.00 sobre tu saldo vencido y solo debes generar un pago por $ 0.00, con este pago tu cuenta queda al corriente y se reactiva tu servicio.\n\nO bien; te puedo ofrecer un convenio en 2 parcialidades sobre tu saldo vencido.\n\n1er pago | 25 de agosto por $1,000.00\n2do pago | 01 de septiembre por $1,000.00\n\nNOTA: Una vez que realices el 1er pago, se reactiva tu servicio.",
          ],
        },
        "agente-pregunta-pago": {
          label: "Agente - Pregunta pago",
          opciones: [
            "De las opciones que te brinde ¿Cuál es la que se adapta a tus posibilidades?",
          ],
        },
        "agente-confirmacion": {
          label: "Agente - Confirmación",
          opciones: [
            "Entonces, ¿Contamos con tu pago el día de hoy?",
            "Entonces, ¿Contamos con tu primera parcialidad el día de hoy?",
          ],
        },
        "agente-factura": {
          label: "Agente - Factura en curso",
          opciones: [
            "Es importante que consideres tu factura del mes en curso, por la cantidad de $0.00 con fecha límite de pago el día dd/mm.",
          ],
        },
        "agente-medios-pago": {
          label: "Agente - Medios de pago",
          opciones: [
            "Si cuentas con alguna tarjeta de crédito o débito puedes realizar tu pago con cargo en línea, marcando desde tu teléfono celular *PAGO (*7246) o bien a través de las siguientes opciones:\n\n• App Mi ATT\n• Portales Bancarios\n\nPara pago en efectivo lo puedes hacer en: Tienda AT&T, 7 Eleven, Elektra, Farmacias del Ahorro, Farmacias Benavides con su línea a 10 dígitos (pago de servicios).",
          ],
        },
        "agente-reporte-pago": {
          label: "Agente - Reporte de pago",
          opciones: [
            "Una vez realizado el pago, te pedimos ponerte en contacto con nosotros a los siguientes números telefónicos:\n\n5544453016 / 5544453023 / 8007003017 / 8007773025\n\nde lunes a viernes de 07:00 a.m. a 09:00 p.m., sábados de 08:00 a.m. a 02:30 p.m. y domingos de 08:00 a.m. a 02:00 p.m. para reportar tu pago, continuar con el acuerdo generado y realizar la activación de tu servicio en un periodo máximo de 24hrs.",
          ],
        },
        "agente-importancia": {
          label: "Agente - Importancia del acuerdo",
          opciones: [
            "Es muy importante el cumplimiento del acuerdo que estamos generando con la finalidad de evitar que continúen los accionamientos por parte del área de Cobranza y no verse afectado en su reporte de buró de crédito.",
          ],
        },
        "agente-privacidad": {
          label: "Agente - Aviso de privacidad",
          opciones: [
            "Le recuerdo que sus datos están protegidos por la ley federal de protección de datos y puede consultar el aviso de privacidad en www.att.com.mx",
          ],
        },
        "agente-despedida": {
          label: "Agente - Despedida",
          opciones: [
            "¿Alguna duda?",
            "Gracias por comunicarse a ASECON en representación de AT&T México.",
            "Le deseamos que tenga un excelente día.",
            "Le deseamos que tenga una excelente tarde.",
            "Le deseamos que tenga una excelente noche.",
          ],
        },
        "otros-retomar": {
          label: "OTROS - Retomar llamada",
          opciones: [
            "Sigo atendiéndole",
            "¿Tiene alguna duda con la información proporcionada?",
          ],
        },
        "otros-no-acepta": {
          label: "OTROS - Cliente no acepta",
          opciones: [
            "Lamento que las opciones que le brinde no se adapten a tus posibilidades. Cualquier duda o situación nos puedes contactar de lunes a viernes de 07:00 a.m. a 09:00 p.m., sábados de 08:00 a.m. a 02:30 p.m. y domingos de 08:00 a.m. a 02:00 p.m. en los siguientes números:\n\n5544453016 / 5544453023 / 8007003017 / 8007773025.",
          ],
        },
        "otros-informacion": {
          label: "OTROS - Información cliente",
          opciones: [
            "Por este medio no puedo visualizar imágenes, por favor me puedes compartir tu comprobante al correo serviciosatt@asecon2006.com.mx",
            "Por este medio no puedo ver las imágenes o escuchar audios, me puedes enviar tus comentarios en texto, por favor.",
          ],
        },
        "otros-cuenta-no-asignada": {
          label: "OTROS - Cuenta no asignada",
          opciones: [
            "Tu cuenta ya no se encuentra con nosotros, es necesario que te comuniques al número 8000511000 para que te brinden más información.",
          ],
        },
        cancelados: {
          label: "CANCELADOS",
          opciones: [
            "Te informo que tu cuenta se encuentra cancelada con un saldo al día de hoy por $0.00, una vez que hayas realizado el pago correspondiente se actualizara tu reporte de buró de crédito y puedes tramitar tu carta finiquito.\n\nUna vez generado tu pago, es necesario que te comuniques con AT&T al 8000511000 para solicitar tu carta finiquito, misma que te llegará a tu correo electrónico en un lapso no mayor a 10 días hábiles.",
          ],
        },
      },
    },
  };

  const mensajesActuales = plantillas[tipoPlantilla]?.mensajes || {};

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = Object.keys(mensajesActuales).filter((key) =>
    mensajesActuales[key]?.label
      ?.toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  const categoriaActual = mensajesActuales[categoria];

  const copiarTexto = (texto) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(texto)
        .then(() => {
          setTextoCopiado(texto);
          setTimeout(() => setTextoCopiado(null), 2000);
        })
        .catch((err) => {
          console.error("Error al copiar: ", err);
          copiarTextoFallback(texto);
        });
    } else {
      copiarTextoFallback(texto);
    }
  };

  const copiarTextoFallback = (texto) => {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setTextoCopiado(texto);
      setTimeout(() => setTextoCopiado(null), 2000);
    } catch (err) {
      console.error("Error al copiar: ", err);
      alert("No se pudo copiar el texto. Por favor, cópialo manualmente.");
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="actions" style={{ padding: "20px 30px" }}>
          <button
            className={`btn ${
              tipoPlantilla === "sin-descuento" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => {
              setTipoPlantilla("sin-descuento");
              setCategoria("mensaje-automatico");
              setBusqueda("");
            }}
          >
            Sin Descuento
          </button>
          <button
            className={`btn ${
              tipoPlantilla === "bonificacion" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => {
              setTipoPlantilla("bonificacion");
              setCategoria("mensaje-automatico");
              setBusqueda("");
            }}
          >
            Bonificación
          </button>
          <button
            className={`btn ${
              tipoPlantilla === "descuento" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => {
              setTipoPlantilla("descuento");
              setCategoria("mensaje-automatico");
              setBusqueda("");
            }}
          >
            Descuento
          </button>
        </div>

        <div className="plantilla-content">
          <div className="plantilla-sidebar">
            <h3>Categorías</h3>
            <div className="busqueda-container">
              <input
                type="text"
                className="busqueda-input"
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  if (e.target.value.trim() !== "") {
                    const filtradas = Object.keys(mensajesActuales).filter(
                      (key) =>
                        mensajesActuales[key]?.label
                          ?.toLowerCase()
                          .includes(e.target.value.toLowerCase()),
                    );
                    if (
                      filtradas.length > 0 &&
                      !filtradas.includes(categoria)
                    ) {
                      setCategoria(filtradas[0]);
                    }
                  }
                }}
              />
              {busqueda && (
                <button
                  className="btn-limpiar-busqueda"
                  onClick={() => {
                    setBusqueda("");
                    setCategoria("mensaje-automatico");
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <div className="categoria-list">
              {categoriasFiltradas.length > 0 ? (
                categoriasFiltradas.map((key) => (
                  <button
                    key={key}
                    className={`categoria-item ${
                      categoria === key ? "active" : ""
                    }`}
                    onClick={() => setCategoria(key)}
                  >
                    {mensajesActuales[key]?.label || key}
                  </button>
                ))
              ) : (
                <div className="empty-categorias">
                  <p>No se encontraron categorías</p>
                </div>
              )}
            </div>
          </div>

          <div className="plantilla-main">
            {categoriaActual ? (
              <>
                <div className="categoria-header">
                  <h2>{categoriaActual.label}</h2>
                </div>
                <div className="opciones-list">
                  {categoriaActual.opciones.map((texto, index) => (
                    <div key={index} className="opcion-card">
                      <div className="opcion-texto">
                        {texto.split("\n").map((linea, i) => {
                          if (linea.trim() === "") return <br key={i} />;
                          const esNota = linea
                            .trim()
                            .toLowerCase()
                            .startsWith("nota:");
                          return (
                            <p key={i} className={esNota ? "nota" : ""}>
                              {linea}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"></span>
                <p>Selecciona una categoría para ver las opciones</p>
              </div>
            )}
          </div>
        </div>

        <div className="plantilla-footer">
          <p>Creado por IAN</p>
        </div>
      </div>
    </div>
  );
};

export default PlantillasWhatsApp;
