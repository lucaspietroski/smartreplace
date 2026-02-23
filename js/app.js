let baseDados = [];
let config = {};
let modoContingencia = false;
let ultimoResultado = [];

async function carregarDados() {
  baseDados = await fetch('/data/base.json').then(r => r.json());
  config = await fetch('/data/config.json').then(r => r.json());

  const select = document.getElementById("modeloSelect");
  select.innerHTML = "";

  baseDados.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item.modelo;
    select.appendChild(option);
  });
}

function classificar(score) {
  if (score >= 90) return { classe: "ideal", tag: "IDEAL", tagClass: "tag-ideal" };
  if (score >= 80) return { classe: "seguro", tag: "SEGURO", tagClass: "tag-seguro" };
  if (score >= 75) return { classe: "viavel", tag: "VIÁVEL", tagClass: "tag-viavel" };
  if (score >= 60) return { classe: "contingencia", tag: "CONTINGÊNCIA", tagClass: "tag-cont" };
  return null;
}

function simular() {
  modoContingencia = false;
  document.getElementById("btnContingencia").style.display = "none";

  const index = document.getElementById("modeloSelect").value;
  const modeloBase = baseDados[index];

  ultimoResultado = baseDados
    .filter(m => m.modelo !== modeloBase.modelo)
    .map(m => {
      const resultado = calcularScore(modeloBase, m, config);
      return {
        modelo: m,
        score: resultado.score,
        comparacao: resultado.comparacao,
        alertas: resultado.alertas
      };
    })
    .sort((a, b) => b.score - a.score);

  renderResultados();
}

function renderResultados() {
  const container = document.getElementById("resultados");
  container.innerHTML = "";

  let exibidos = 0;

  ultimoResultado.forEach(r => {

    if (r.score < 60) return;
    if (!modoContingencia && r.score < config.scoreMinimo) return;

    const classificacao = classificar(r.score);
    if (!classificacao) return;

    const card = document.createElement("div");
    card.className = "card";

    let alertaHTML = "";

   if (r.alertas && r.alertas.length > 0) {

  alertaHTML = `
    <div style="margin-top:8px; font-weight:bold; color:#B45309;">
      <span 
        title="${r.alertas.join(" | ")}"
        style="cursor:help; display:inline-flex; align-items:center; gap:6px;">
        ⚠ <span style="color:#B45309;">Atenção</span>
      </span>
    </div>
  `;
}
    card.innerHTML = `
      <div>
        <strong>${r.modelo.modelo}</strong>
        <span class="tag ${classificacao.tagClass}">${classificacao.tag}</span>
      </div>

      <div class="score ${classificacao.classe}">
        ${r.score}%
      </div>

      ${alertaHTML}

      <div style="margin-top:12px; font-size:14px;">
        <strong>De / Para Técnico:</strong><br><br>

        <strong>PPM:</strong> ${r.comparacao.ppm.base} → ${r.comparacao.ppm.comparado}<br>
        <strong>Ciclo:</strong> ${r.comparacao.ciclo.base} → ${r.comparacao.ciclo.comparado}<br>
        <strong>Papel:</strong> ${r.comparacao.papel.base} → ${r.comparacao.papel.comparado}<br>
        <strong>Cor:</strong> ${r.comparacao.cor.base} → ${r.comparacao.cor.comparado}<br>
        <strong>Tecnologia:</strong> ${r.comparacao.tecnologia.base} → ${r.comparacao.tecnologia.comparado}<br>
        <strong>Multifuncional:</strong> 
        ${r.comparacao.multifuncional.base ? "Sim" : "Não"} 
        → 
        ${r.comparacao.multifuncional.comparado ? "Sim" : "Não"}
      </div>

      <div style="margin-top:12px;">
        Estoque: ${r.modelo.estoque}<br>
        Status: ${r.modelo.status}
      </div>
    `;

    container.appendChild(card);
    exibidos++;
  });

  if (exibidos === 0) {
    document.getElementById("btnContingencia").style.display = "inline-block";
    container.innerHTML = `
      <div class="card">
        <strong>Nenhuma substituição acima do score mínimo.</strong>
        <p>Você pode ativar modo contingência.</p>
      </div>
    `;
  }
}

function ativarContingencia() {
  modoContingencia = true;
  renderResultados();
}

carregarDados();

function exportarPDF() {

  const elemento = document.getElementById("resultados");

  const opcoes = {
    margin: 10,
    filename: 'SmartReplace-Relatorio.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css'] }
  };

  html2pdf().set(opcoes).from(elemento).save();
}

