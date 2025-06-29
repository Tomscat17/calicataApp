let calicatasGuardadas = []; // Acá se almacenan las calicatas
let datosProyecto = null;
let contadorCalicatas = 1;
let totalEstratos = 0;

let db;
const DB_NAME = "proyectosDB";
const DB_VERSION = 1;

window.onload = function () {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onerror = function (event) {
    console.error("❌ Error al abrir la base de datos:", event.target.error);
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("✅ Base de datos abierta:", DB_NAME);
  };

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("proyectos")) {
      const store = db.createObjectStore("proyectos", { keyPath: "id", autoIncrement: true });
      console.log("📦 Store 'proyectos' creado");
    }
  };
};


document.addEventListener('DOMContentLoaded', () => {
  const btnIniciar = document.getElementById('btn-iniciar');
  const btnVer = document.getElementById('btn-ver');

  btnIniciar.addEventListener('click', iniciarProyecto);
  btnVer.addEventListener('click', verProyectos);
});

function iniciarProyecto() {
  const form = document.getElementById('form-proyecto');

  datosProyecto = {
    proyecto: form.proyecto.value.trim(),
    mandante: form.mandante.value.trim(),
    sector: form.sector.value.trim(),
    laboratorista: form.laboratorista.value.trim(),
    ubicacion: form.ubicacion.value.trim()
  };

  if (Object.values(datosProyecto).some(valor => valor === '')) {
    alert('Por favor completa todos los campos del proyecto.');
    return;
  }

  console.log('✅ Proyecto iniciado:', datosProyecto);
  document.getElementById('pantalla-proyecto').style.display = 'none';
  document.getElementById('menu-proyecto').style.display = 'block';
  document.getElementById('nombre-proyecto-header').textContent = `Proyecto: ${datosProyecto.proyecto}`;

  mostrarPantallaCalicata();
}

function verProyectos() {
  const contenedor = document.getElementById('contenedor-proyectos');
  contenedor.innerHTML = ''; // Limpiar contenido previo
  document.getElementById('vista-proyectos').style.display = 'block';

  const transaction = db.transaction(["proyectos"], "readonly");
  const store = transaction.objectStore("proyectos");
  const request = store.getAll();

  request.onsuccess = function () {
    const proyectos = request.result;

    if (proyectos.length === 0) {
      contenedor.innerHTML = "<p>No hay proyectos guardados.</p>";
      return;
    }

    proyectos.forEach((p, idx) => {
      const divProyecto = document.createElement('div');
      divProyecto.style.border = '1px solid #ccc';
      divProyecto.style.padding = '10px';
      divProyecto.style.marginBottom = '15px';

      let html = `
        <h3>Proyecto ${idx + 1}: ${p.datos.proyecto}</h3>
        <p><strong>Mandante:</strong> ${p.datos.mandante}</p>
        <p><strong>Sector:</strong> ${p.datos.sector}</p>
        <p><strong>Laboratorista:</strong> ${p.datos.laboratorista}</p>
        <p><strong>Ubicación:</strong> ${p.datos.ubicacion}</p>
        <p><strong>Fecha guardado:</strong> ${new Date(p.fechaGuardado).toLocaleString()}</p>
        <h4>Calicatas:</h4>
      `;

      p.calicatas.forEach((c, i) => {
        html += `
          <div style="margin-left: 20px; border: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
            <h5>Calicata ${i + 1}: ${c.nombre}</h5>
            <p><strong>Fecha:</strong> ${c.fecha}</p>
            <p><strong>DM:</strong> ${c.dm}</p>
            <p><strong>Lado:</strong> ${c.lado}</p>
            <p><strong>Napa:</strong> ${c.napa}</p>
            <p><strong>Espesor Capa Vegetal:</strong> ${c.espesor}</p>
            <p><strong>Confección:</strong> ${c.confeccion}</p>
            <p><strong>Forma:</strong> ${c.forma}</p>
            <p><strong>Observaciones:</strong> ${c.observaciones.join('; ')}</p>
        `;

        // Mostrar imágenes en miniatura (si existen)
        if (c.fotos?.foto1) {
          const img1 = URL.createObjectURL(c.fotos.foto1);
          html += `<p><strong>Foto Calicata + Cartel:</strong><br><img src="${img1}" style="max-width:150px;"></p>`;
        }
        if (c.fotos?.foto2) {
          const img2 = URL.createObjectURL(c.fotos.foto2);
          html += `<p><strong>Foto Calicata + Camino:</strong><br><img src="${img2}" style="max-width:150px;"></p>`;
        }

        html += `<h5>Estratos:</h5>`;
        c.estratos.forEach((e, j) => {
          html += `
            <div style="margin-left: 20px;">
              <h6>Estrato ${j + 1}</h6>
              <p><strong>Desde:</strong> ${e.desde} m | <strong>Hasta:</strong> ${e.hasta} m</p>
              <p><strong>Tamaño máx:</strong> ${e.tmax} | <strong>Bolones:</strong> ${e.bolones}</p>
              <p><strong>Grava:</strong> ${e.grava} | <strong>Arena:</strong> ${e.arena} | <strong>Fino:</strong> ${e.fino}</p>
              <p><strong>Color:</strong> ${e.color} | <strong>Suelo:</strong> ${e.suelo}</p>
              <p><strong>Olor:</strong> ${e.olor} | <strong>Graduación:</strong> ${e.graduacion}</p>
              <p><strong>Plasticidad:</strong> ${e.plasticidad} | <strong>Forma Partículas:</strong> ${e.forma}</p>
              <p><strong>Humedad:</strong> ${e.humedad} | <strong>Compacidad:</strong> ${e.compacidad}</p>
              <p><strong>Consistencia:</strong> ${e.consistencia}</p>
              <p><strong>Estructura:</strong> ${e.estructura} ${e.estructuraOtro || ''}</p>
              <p><strong>Cementación:</strong> ${e.cementacion}</p>
              <p><strong>Origen:</strong> ${e.origen} ${e.origenOtro || ''}</p>
              <p><strong>Materia Orgánica:</strong> ${e.organica}</p>
              <p><strong>Nombre Local:</strong> ${e.nombrelocal}</p>
            </div>
          `;
        });

        html += `</div>`;
      });

      divProyecto.innerHTML = html;
      contenedor.appendChild(divProyecto);
    });
  };

  request.onerror = function (e) {
    console.error("❌ Error al obtener los proyectos:", e.target.error);
  };
}


function mostrarPantallaCalicata() {
  if (!document.getElementById('pantalla-calicata')) {
    const calicataDiv = document.createElement('div');
    calicataDiv.id = 'pantalla-calicata';

    calicataDiv.innerHTML = `
      <h2>Registrar Calicata</h2>
      <form id="form-calicata">
        <label>Nombre de Calicata:</label>
        <input type="text" id="nombre-calicata" readonly>

        <label>Fecha de Ensayo:</label>
        <input type="text" id="fecha-ensayo" readonly>

        <label for="dm">Dm Calicata:</label>
        <input type="number" id="dm" step="0.01" required>

        <label for="lado">Lado de la Calicata:</label>
        <select id="lado" required>
          <option value="" selected disabled>Seleccione</option>
          <option value="Derecha">Derecha</option>
          <option value="Izquierda">Izquierda</option>
        </select>

        <label for="napa">Napa de Agua (m):</label>
        <input type="number" id="napa" step="0.01" required>

        <label for="espesor">Espesor Capa Vegetal (m):</label>
        <input type="number" id="espesor" step="0.01" required>

        <label for="confeccion">Confección de la Calicata:</label>
        <select id="confeccion" required>
          <option value="" selected disabled>Seleccione</option>
          <option value="Cliente">Cliente</option>
          <option value="Laboral">Laboral</option>
        </select>

        <label for="forma">Forma de Confección:</label>
        <select id="forma" required>
          <option value="" selected disabled>Seleccione</option>
          <option value="Manual">Manual</option>
          <option value="Maquinaria">Maquinaria</option>
        </select>

        <hr>
        <h3>Estratificación del Suelo</h3>
        

        <div id="estratos-container"></div>
        <div id="observaciones-container"></div>

        <hr>
        <h4>Registro de Calicata</h4>

        <label>Foto Calicata + Cartel + Regla:</label>
        <input type="file" id="foto1" accept="image/*" capture="environment">
        <br>
        <img id="preview1" style="max-width: 100%; margin-top: 10px; display: none;">

        <label style="margin-top: 15px;">Foto Calicata + Camino:</label>
        <input type="file" id="foto2" accept="image/*" capture="environment">
        <br>
        <img id="preview2" style="max-width: 100%; margin-top: 10px; display: none;">

        <div class="botones" style="margin-top: 20px;">
          <button type="button" id="btn-guardar-calicata">Guardar Calicata</button>
          <button type="button" id="btn-guardar-proyecto" style="background-color: #28a745;">Guardar Proyecto</button>
        </div>
      </form>
    `;

    document.body.appendChild(calicataDiv);

    document.getElementById('btn-guardar-calicata').addEventListener('click', guardarCalicata);
    document.getElementById('btn-guardar-proyecto').addEventListener('click', guardarProyecto);
    
  }

  document.getElementById('nombre-calicata').value = `Calicata ${contadorCalicatas}`;
  document.getElementById('fecha-ensayo').value = new Date().toLocaleDateString();

  totalEstratos = 0;
  document.getElementById('estratos-container').innerHTML = '';
  document.getElementById('observaciones-container').innerHTML = '';

  // Agregar primer estrato
  agregarEstrato(false);
  // Botón para agregar más estratos
  //const botonAgregar = document.createElement('button');
  //botonAgregar.type = 'button';
  //botonAgregar.id = 'btn-agregar-estrato';
  //botonAgregar.textContent = 'Agregar Estrato';
  //botonAgregar.style.marginTop = '10px';

  //document.getElementById('estratos-container').appendChild(botonAgregar);



  //document.getElementById('btn-agregar-estrato').addEventListener('click', agregarEstrato);

  

}


function mostrarEstratos() {
  const numeroEstratos = parseInt(document.getElementById('numero-estratos').value);
  const container = document.getElementById('estratos-container');
  const obsContainer = document.getElementById('observaciones-container');

  container.innerHTML = '';
  obsContainer.innerHTML = '';

  for (let i = 1; i <= numeroEstratos; i++) {
    const estrato = document.createElement('div');
    estrato.classList.add('estrato');

    estrato.innerHTML = `
      <hr>

      <h4>Estrato ${i}</h4>
        

      <strong>Profundidad estratigráfica (m)</strong><br>
      <label>Desde (m):</label>
      <input type="number" step="0.01" id="desde${i}">
      <label>Hasta (m):</label>
      <input type="number" step="0.01" id="hasta${i}">

      <h5>Granulometría del Suelo</h5>
      <strong>Total</strong><br>
      <label>T. Max. (pulg):</label>
      <input type="number" step="0.01" id="tmax${i}">
      <label>Bolones (% > 80 mm):</label>
      <input type="number" step="0.01" id="bolones${i}">

      <strong>Fracción menor que tamiz 80 mm</strong><br>
      <label>Grava (%):</label>
      <input type="number" step="0.01" id="grava${i}">
      <label>Arena (%):</label>
      <input type="number" step="0.01" id="arena${i}">
      <label>Fino (%):</label>
      <input type="number" step="0.01" id="fino${i}">


      <label>Tipo de Suelo Fino:</label>
      <select id="suelo${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Arcilla">Arcilla</option>
        <option value="Limo">Limo</option>
      </select>

      <label>Color en estado natural:</label>
      <input type="text" id="color${i}">

      <label>Olor:</label>
      <select id="olor${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Ninguno">Ninguno</option>
        <option value="Térreo">Térreo</option>
        <option value="Orgánico">Orgánico</option>
      </select>

      <label>Graduación:</label>
      <select id="graduacion${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Fina">Fina</option>
        <option value="Media">Media</option>
        <option value="Gruesa">Gruesa</option>
      </select>

      <label>Plasticidad:</label>
      <select id="plasticidad${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Ninguna">Ninguna</option>
        <option value="Baja">Baja</option>
        <option value="Media">Media</option>
        <option value="Alta">Alta</option>
      </select>

      <label>Forma de Partículas:</label>
      <select id="forma${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Redondeado">Redondeado</option>
        <option value="Sub-redondeado">Sub-redondeado</option>
        <option value="Angular">Angular</option>
        <option value="Sub-angular">Sub-angular</option>
      </select>

      <label>Humedad:</label>
      <select id="humedad${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Seco">Seco</option>
        <option value="Húmedo">Húmedo</option>
        <option value="Mojado">Mojado</option>
        <option value="Saturado">Saturado</option>
      </select>

      <label>Compacidad:</label>
      <select id="compacidad${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Densa">Densa</option>
        <option value="Suelta">Suelta</option>
      </select>

      <label>Consistencia:</label>
      <select id="consistencia${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Blanda">Blanda</option>
        <option value="Media">Media</option>
        <option value="Firme">Firme</option>
        <option value="Muy firme">Muy firme</option>
        <option value="Dura">Dura</option>
      </select>

      <label>Estructura:</label>
      <select id="estructura${i}" onchange="mostrarOtro(this, 'estructuraOtro${i}')">
        <option value="" selected disabled>Seleccione</option>
        <option value="Estratificado">Estratificado</option>
        <option value="Laminado">Laminado</option>
        <option value="Homog. Vesicular">Homog. Vesicular</option>
        <option value="Otro">Otro (especifique)</option>
      </select>
      <input type="text" id="estructuraOtro${i}" placeholder="Otro (estructura)" style="display:none;">

      <label>Cementación:</label>
      <select id="cementacion${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Débil">Débil</option>
        <option value="Fuerte">Fuerte</option>
      </select>

      <label>Origen:</label>
      <select id="origen${i}" onchange="mostrarOtro(this, 'origenOtro${i}')">
        <option value="" selected disabled>Seleccione</option>
        <option value="Fluvial">Fluvial</option>
        <option value="Artificial">Artificial</option>
        <option value="Otro">Otro (especifique)</option>
      </select>
      <input type="text" id="origenOtro${i}" placeholder="Otro (origen)" style="display:none;">

      <label>Materia Orgánica o Raíces:</label>
      <select id="organica${i}">
        <option value="" selected disabled>Seleccione</option>
        <option value="Sin indicios">Sin indicios</option>
        <option value="Mediana">Mediana</option>
        <option value="Abundante">Abundante</option>
      </select>

      <label>Nombre Local del Suelo (si existe):</label>
      <input type="text" id="nombrelocal${i}">

      <button type="button" class="btn-eliminar-estrato" data-index="${i}" style="margin-top: 10px;">Eliminar Estrato</button>
    `;
    container.appendChild(estrato);
    
  }

  obsContainer.innerHTML = '<hr><h4>Observaciones Finales</h4>';
  for (let j = 1; j <= numeroEstratos; j++) {
    const obsDiv = document.createElement('div');
    obsDiv.innerHTML = `
      <label for="observacion${j}">Observación Estrato ${j}:</label>
      <textarea id="observacion${j}" rows="2" style="width:100%;"></textarea>
    `;
    obsContainer.appendChild(obsDiv);
  }
  

}

function mostrarOtro(selectElement, inputId) {
  const input = document.getElementById(inputId);
  input.style.display = selectElement.value === "Otro" ? "block" : "none";
  if (selectElement.value !== "Otro") input.value = "";
}

document.addEventListener('change', function (event) {
  if (event.target.id === 'foto1' || event.target.id === 'foto2') {
    const file = event.target.files[0];
    const previewId = event.target.id === 'foto1' ? 'preview1' : 'preview2';
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.getElementById(previewId);
        img.src = e.target.result;
        img.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }
});

function guardarCalicata() {
  const confirmar = confirm("¿Deseas guardar esta calicata?");
  if (!confirmar) return;

  const calicata = {
    nombre: document.getElementById('nombre-calicata').value,
    fecha: document.getElementById('fecha-ensayo').value,
    dm: document.getElementById('dm').value,
    lado: document.getElementById('lado').value,
    napa: document.getElementById('napa').value,
    espesor: document.getElementById('espesor').value,
    confeccion: document.getElementById('confeccion').value,
    forma: document.getElementById('forma').value,
    estratos: [],
    observaciones: [],
    fotos: {
      foto1: document.getElementById('foto1').files[0] || null,
      foto2: document.getElementById('foto2').files[0] || null
    }
  };

  const numeroEstratos = document.querySelectorAll('.estrato').length;
  for (let i = 1; i <= numeroEstratos; i++) {
    const estrato = {
      desde: document.getElementById(`desde${i}`).value,
      hasta: document.getElementById(`hasta${i}`).value,
      tmax: document.getElementById(`tmax${i}`).value,
      bolones: document.getElementById(`bolones${i}`).value,
      grava: document.getElementById(`grava${i}`).value,
      arena: document.getElementById(`arena${i}`).value,
      fino: document.getElementById(`fino${i}`).value,
      color: document.getElementById(`color${i}`).value,
      suelo: document.getElementById(`suelo${i}`).value,
      olor: document.getElementById(`olor${i}`).value,
      graduacion: document.getElementById(`graduacion${i}`).value,
      plasticidad: document.getElementById(`plasticidad${i}`).value,
      forma: document.getElementById(`forma${i}`).value,
      humedad: document.getElementById(`humedad${i}`).value,
      compacidad: document.getElementById(`compacidad${i}`).value,
      consistencia: document.getElementById(`consistencia${i}`).value,
      estructura: document.getElementById(`estructura${i}`).value,
      estructuraOtro: document.getElementById(`estructuraOtro${i}`).value,
      cementacion: document.getElementById(`cementacion${i}`).value,
      origen: document.getElementById(`origen${i}`).value,
      origenOtro: document.getElementById(`origenOtro${i}`).value,
      organica: document.getElementById(`organica${i}`).value,
      nombrelocal: document.getElementById(`nombrelocal${i}`).value
    };
    calicata.estratos.push(estrato);
  }

  for (let i = 1; i <= numeroEstratos; i++) {
    const obs = document.getElementById(`observacion${i}`).value;
    calicata.observaciones.push(obs);
  }

  calicatasGuardadas.push(calicata);
  console.log("✅ Calicata guardada:", calicata);

  contadorCalicatas++; // Incrementa para la siguiente

  // Limpia el formulario excepto los datos generales del proyecto
  resetearFormularioCalicata();
}

function resetearFormularioCalicata() {
  // Limpiar campos manualmente
  document.getElementById('dm').value = '';
  document.getElementById('lado').selectedIndex = 0;
  document.getElementById('napa').value = '';
  document.getElementById('espesor').value = '';
  document.getElementById('confeccion').selectedIndex = 0;
  document.getElementById('forma').selectedIndex = 0;

  // Limpiar fotos
  const foto1 = document.getElementById('foto1');
  const preview1 = document.getElementById('preview1');
  foto1.value = '';
  preview1.src = '';
  preview1.style.display = 'none';

  const foto2 = document.getElementById('foto2');
  const preview2 = document.getElementById('preview2');
  foto2.value = '';
  preview2.src = '';
  preview2.style.display = 'none';

  // Limpiar estratos y observaciones
  totalEstratos = 0;
  const containerEstratos = document.getElementById('estratos-container');
  const containerObs = document.getElementById('observaciones-container');
  containerEstratos.innerHTML = '';
  containerObs.innerHTML = '';

  // Reiniciar nombre y fecha de la nueva calicata
  document.getElementById('nombre-calicata').value = `Calicata ${contadorCalicatas}`;
  document.getElementById('fecha-ensayo').value = new Date().toLocaleDateString();

  // Agregar el primer estrato
  agregarEstrato(false);
}



function guardarProyecto() {
  const confirmar = confirm("¿Deseas guardar el proyecto completo?");
  if (!confirmar) return;

  const proyectoCompleto = {
    datos: datosProyecto,
    calicatas: calicatasGuardadas,
    fechaGuardado: new Date().toISOString()
  };

  const transaction = db.transaction(["proyectos"], "readwrite");
  const store = transaction.objectStore("proyectos");
  const request = store.add(proyectoCompleto);

  request.onsuccess = function () {
    console.log("📦 Proyecto guardado en IndexedDB:", proyectoCompleto);
    alert("✅ Proyecto guardado correctamente.");

    // Reiniciar estado
    datosProyecto = null;
    calicatasGuardadas = [];
    contadorCalicatas = 1;

    // UI reset
    document.getElementById('pantalla-calicata').remove();
    document.getElementById('pantalla-proyecto').style.display = 'block';
    document.getElementById('menu-proyecto').style.display = 'none';
    document.getElementById('form-proyecto').reset();
  };

  request.onerror = function (e) {
    console.error("❌ Error al guardar el proyecto:", e.target.error);
    alert("❌ Error al guardar el proyecto.");
  };
}


  

function agregarEstrato(confirmarMensaje = true) {

  if (totalEstratos >= 3) {
    alert("No puedes agregar más de 3 estratos.");
    return;
  }

  if (confirmarMensaje) {
    const confirmar = confirm("¿Estás seguro que deseas agregar un nuevo estrato?");
    if (!confirmar) return;
  }

  totalEstratos++;
  const i = totalEstratos;

  //const botonAntiguo = document.getElementById('btn-agregar-estrato');
  //if (botonAntiguo) {
    //botonAntiguo.remove();
  //}

  const estrato = document.createElement('div');
  estrato.classList.add('estrato');

  estrato.innerHTML = `
    <hr>
      
      <h4>Estrato ${i}</h4>
        



    <label>Desde (m):</label>
    <input type="number" step="0.01" id="desde${i}">
    <label>Hasta (m):</label>
    <input type="number" step="0.01" id="hasta${i}">

    <h5>Granulometría del Suelo</h5>
    <strong>Total</strong><br>
    <label>T. Max. (pulg):</label>
    <input type="number" step="0.01" id="tmax${i}">
    <label>Bolones (% > 80 mm):</label>
    <input type="number" step="0.01" id="bolones${i}">

    <strong>Fracción menor que tamiz 80 mm</strong><br>
    <label>Grava (%):</label>
    <input type="number" step="0.01" id="grava${i}">
    <label>Arena (%):</label>
    <input type="number" step="0.01" id="arena${i}">
    <label>Fino (%):</label>
    <input type="number" step="0.01" id="fino${i}">

    <label>Color en estado natural:</label>
    <input type="text" id="color${i}">

    <label>Tipo de Suelo Fino:</label>
    <select id="suelo${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Arcilla">Arcilla</option>
      <option value="Limo">Limo</option>
    </select>

    <label>Olor:</label>
    <select id="olor${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Ninguno">Ninguno</option>
      <option value="Térreo">Térreo</option>
      <option value="Orgánico">Orgánico</option>
    </select>

    <label>Graduación:</label>
    <select id="graduacion${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Fina">Fina</option>
      <option value="Media">Media</option>
      <option value="Gruesa">Gruesa</option>
    </select>

    <label>Plasticidad:</label>
    <select id="plasticidad${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Ninguna">Ninguna</option>
      <option value="Baja">Baja</option>
      <option value="Media">Media</option>
      <option value="Alta">Alta</option>
    </select>

    <label>Forma de Partículas:</label>
    <select id="forma${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Redondeado">Redondeado</option>
      <option value="Sub-redondeado">Sub-redondeado</option>
      <option value="Angular">Angular</option>
      <option value="Sub-angular">Sub-angular</option>
    </select>

    <label>Humedad:</label>
    <select id="humedad${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Seco">Seco</option>
      <option value="Húmedo">Húmedo</option>
      <option value="Mojado">Mojado</option>
      <option value="Saturado">Saturado</option>
    </select>

    <label>Compacidad:</label>
    <select id="compacidad${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Densa">Densa</option>
      <option value="Suelta">Suelta</option>
    </select>

    <label>Consistencia:</label>
    <select id="consistencia${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Blanda">Blanda</option>
      <option value="Media">Media</option>
      <option value="Firme">Firme</option>
      <option value="Muy firme">Muy firme</option>
      <option value="Dura">Dura</option>
    </select>

    <label>Estructura:</label>
    <select id="estructura${i}" onchange="mostrarOtro(this, 'estructuraOtro${i}')">
      <option value="" selected disabled>Seleccione</option>
      <option value="Estratificado">Estratificado</option>
      <option value="Laminado">Laminado</option>
      <option value="Homog. Vesicular">Homog. Vesicular</option>
      <option value="Otro">Otro (especifique)</option>
    </select>
    <input type="text" id="estructuraOtro${i}" style="display:none;" placeholder="Otro (estructura)">

    <label>Cementación:</label>
    <select id="cementacion${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Débil">Débil</option>
      <option value="Fuerte">Fuerte</option>
    </select>

    <label>Origen:</label>
    <select id="origen${i}" onchange="mostrarOtro(this, 'origenOtro${i}')">
      <option value="" selected disabled>Seleccione</option>
      <option value="Fluvial">Fluvial</option>
      <option value="Artificial">Artificial</option>
      <option value="Otro">Otro (especifique)</option>
    </select>
    <input type="text" id="origenOtro${i}" style="display:none;" placeholder="Otro (origen)">

    <label>Materia Orgánica o Raíces:</label>
    <select id="organica${i}">
      <option value="" selected disabled>Seleccione</option>
      <option value="Sin indicios">Sin indicios</option>
      <option value="Mediana">Mediana</option>
      <option value="Abundante">Abundante</option>
    </select>

    <label>Nombre Local del Suelo (si existe):</label>
    <input type="text" id="nombrelocal${i}">

    <button type="button" class="btn-eliminar-estrato" data-index="${i}" style="margin-top: 10px;">Eliminar Estrato</button>
  `;

  document.getElementById('estratos-container').appendChild(estrato);
  

  // Asociar el botón de eliminar
  const btnEliminar = estrato.querySelector('.btn-eliminar-estrato');
  btnEliminar.addEventListener('click', () => eliminarEstrato(i));


  // Añadir observación al final
  const obs = document.createElement('div');
  obs.innerHTML = `
    <label for="observacion${i}">Observación Estrato ${i}:</label>
    <textarea id="observacion${i}" rows="2" style="width:100%;"></textarea>
  `;
  document.getElementById('observaciones-container').appendChild(obs);
  
  
  // Si ya hay 3 estratos, deshabilitar el botón de agregar estrato
  if (totalEstratos === 3) {
    const botonAgregar = document.getElementById('btn-agregar-estrato');
    if (botonAgregar) {
      botonAgregar.disabled = true; // Deshabilita el botón
    }
  }

  // Eliminar botón anterior si existe
const botonAnterior = document.getElementById('btn-agregar-estrato');
if (botonAnterior) {
  botonAnterior.remove();
}

  // Crear nuevamente el botón y moverlo abajo del nuevo estrato
  
  const botonAgregar = document.createElement('button');
  botonAgregar.type = 'button';
  botonAgregar.id = 'btn-agregar-estrato';
  botonAgregar.textContent = 'Agregar Estrato';
  botonAgregar.style.marginTop = '10px';

  botonAgregar.addEventListener('click', () => agregarEstrato(true));
  document.getElementById('estratos-container').appendChild(botonAgregar);
}

function eliminarEstrato(index) {
  const confirmar = confirm(`¿Deseas eliminar el estrato ${index}?`);
  if (!confirmar) return;

  // Buscar y eliminar el estrato
  const estrato = document.getElementById(`desde${index}`)?.closest('.estrato');
  const obs = document.getElementById(`observacion${index}`)?.parentElement;

  if (estrato) estrato.remove();
  if (obs) obs.remove();

  totalEstratos--;

  // Reordenar los títulos e IDs de todos los estratos y observaciones
  const estratos = document.querySelectorAll('.estrato');
  const observaciones = document.querySelectorAll('#observaciones-container > div');

  estratos.forEach((estrato, idx) => {
    const nuevoIndex = idx + 1;
    estrato.querySelector('h4').textContent = `Estrato ${nuevoIndex}`;
    estrato.querySelector('.btn-eliminar-estrato').dataset.index = nuevoIndex;
  });

  observaciones.forEach((obsDiv, idx) => {
    const nuevoIndex = idx + 1;
    obsDiv.querySelector('label').textContent = `Observación Estrato ${nuevoIndex}:`;
    obsDiv.querySelector('textarea').id = `observacion${nuevoIndex}`;
  });

  const botonAgregar = document.getElementById('btn-agregar-estrato');
  if (botonAgregar) botonAgregar.disabled = false;
}

