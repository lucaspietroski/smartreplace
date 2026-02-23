function calcularScore(base, comparado, config) {

  let score = 0;
  let alertas = [];

  const comparacao = {
    ppm: { base: base.ppm, comparado: comparado.ppm },
    ciclo: { base: base.ciclo, comparado: comparado.ciclo },
    papel: { base: base.papel, comparado: comparado.papel },
    cor: { base: base.cor, comparado: comparado.cor },
    tecnologia: { base: base.tecnologia, comparado: comparado.tecnologia },
    multifuncional: { base: base.multifuncional, comparado: comparado.multifuncional }
  };

  // Tecnologia
  if (base.tecnologia === comparado.tecnologia) {
    score += 20;
  }

  // Cor
  if (base.cor === comparado.cor) {
    score += 20;
  } else {
    score -= 15;
    alertas.push(`Cor diferente (${base.cor} → ${comparado.cor})`);
  }

  // PPM
  let diffPPM = Math.abs(base.ppm - comparado.ppm) / base.ppm;
  score += 20 * (1 - diffPPM);

  // Ciclo
  let diffCiclo = Math.abs(base.ciclo - comparado.ciclo) / base.ciclo;
  score += 20 * (1 - diffCiclo);

  // Papel
  if (base.papel === comparado.papel) {
    score += 10;
  } else {
    score -= 20;
    alertas.push(`Papel diferente (${base.papel} → ${comparado.papel})`);
  }

  // Multifuncional vs Impressora
  if (base.multifuncional !== comparado.multifuncional) {
    score -= 15;
    alertas.push("Tipo diferente (Impressora vs Multifuncional)");
  }

  // Estratégico
  score += comparado.estoque > 5 ? config.pesoEstoque : 0;
  score += comparado.prioridade;

  if (comparado.status === "Descontinuado")
    score += config.penalidadeDescontinuado;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    comparacao,
    alertas
  };
}
