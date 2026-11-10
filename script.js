// Draws yeast tRNA-Phe secondary structure as an arc diagram in #arc-diagram.
(function () {
  const seq = "GCGGAUUUAGCUCAGUUGGGAGAGCGCCAGACUGAAGAUCUGGAGGUCCUGUGUUCGAUCCACAGAAUUCGCACCA";
  const dot = "(((((((..((((........)))).(((((.......))))).....(((((.......))))))))))))....";

  const svg = document.getElementById("arc-diagram");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";

  // Pair each "(" with its matching ")"
  const pairs = [];
  const stack = [];
  for (let i = 0; i < dot.length; i++) {
    if (dot[i] === "(") stack.push(i);
    else if (dot[i] === ")") pairs.push([stack.pop(), i]);
  }
  const paired = new Set(pairs.flat());

  // Layout in SVG user units; the viewBox scales to the container width
  const step = 10;
  const pad = 6;
  const width = pad * 2 + step * (seq.length - 1);
  const maxSpan = Math.max(...pairs.map(([a, b]) => b - a));
  const FLAT = 0.42; // vertical squash so long-range pairs stay compact
  const maxH = ((maxSpan * step) / 2) * FLAT;
  const baseY = maxH + 8;
  svg.setAttribute("viewBox", `0 0 ${width} ${baseY + 14}`);

  const x = (i) => pad + i * step;

  // Arcs: half-ellipses whose height scales with the pair distance
  pairs
    .sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]))
    .forEach(([a, b], k) => {
      const rx = ((b - a) * step) / 2;
      const ry = rx * FLAT;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", `M ${x(a)} ${baseY} A ${rx} ${ry} 0 0 1 ${x(b)} ${baseY}`);
      path.setAttribute("pathLength", "1"); // normalize length for the draw-in animation
      path.classList.add("draw");
      path.style.setProperty("--delay", `${(k * 0.035).toFixed(3)}s`);
      svg.appendChild(path);
    });

  // Sequence letters along the baseline
  for (let i = 0; i < seq.length; i++) {
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", x(i));
    t.setAttribute("y", baseY + 12);
    t.textContent = seq[i];
    if (paired.has(i)) t.classList.add("paired");
    svg.appendChild(t);
  }
})();
