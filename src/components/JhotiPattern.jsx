// A faint, repeating jhoti chita pattern for section backgrounds: a lotus in each tile,
// rosettes where tiles meet, rice-stalk sprigs, dotted rings and a pair of Lakshmi feet.
// Drawn in currentColor, so set the colour and opacity from the className.
const ring = (count, offset = 0) => Array.from({ length: count }, (_, i) => offset + (i * 360) / count)

export default function JhotiPattern({ className = '', tile = 280 }) {
  const c = tile / 2
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern id="jhoti-pattern" width={tile} height={tile} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            {/* Lotus in the middle of the tile */}
            {ring(8).map((a) => (
              <g key={`l${a}`} transform={`rotate(${a} ${c} ${c})`}>
                <path d={`M${c} ${c - 50} C${c + 11} ${c - 38} ${c + 11} ${c - 20} ${c} ${c - 10} C${c - 11} ${c - 20} ${c - 11} ${c - 38} ${c} ${c - 50} Z`} />
                <path d={`M${c} ${c - 44} L${c} ${c - 16}`} opacity="0.6" />
              </g>
            ))}
            <circle cx={c} cy={c} r="4" />
            {ring(16, 11.25).map((a) => (
              <circle key={`d${a}`} cx={c} cy={c - 60} r="1.4" fill="currentColor" stroke="none" transform={`rotate(${a} ${c} ${c})`} />
            ))}
            <circle cx={c} cy={c} r="68" strokeDasharray="0.1 7" strokeWidth="1.8" opacity="0.8" />

            {/* Rosette on the tile corner (the four quarters meet into one flower) */}
            {[[0, 0], [tile, 0], [0, tile], [tile, tile]].map(([x, y]) =>
              ring(6).map((a) => (
                <path key={`r${x}${y}${a}`} d={`M${x} ${y - 26} C${x + 7} ${y - 18} ${x + 7} ${y - 8} ${x} ${y - 4} C${x - 7} ${y - 8} ${x - 7} ${y - 18} ${x} ${y - 26} Z`} transform={`rotate(${a} ${x} ${y})`} />
              )),
            )}

            {/* Rice-stalk sprigs on the left and right edges */}
            {[[0, c], [tile, c]].map(([x, y]) => (
              <g key={`s${x}`}>
                <path d={`M${x} ${y - 34} L${x} ${y + 34}`} />
                {[-26, -14, -2, 10, 22].map((dy) => (
                  <g key={dy}>
                    <path d={`M${x} ${y + dy} C${x + 6} ${y + dy - 6} ${x + 12} ${y + dy - 6} ${x + 16} ${y + dy - 10}`} />
                    <path d={`M${x} ${y + dy} C${x - 6} ${y + dy - 6} ${x - 12} ${y + dy - 6} ${x - 16} ${y + dy - 10}`} />
                  </g>
                ))}
              </g>
            ))}

            {/* Creeper curls on the top and bottom edges */}
            {[[c, 0], [c, tile]].map(([x, y]) => (
              <g key={`v${y}`}>
                <path d={`M${x - 36} ${y} C${x - 24} ${y - 14} ${x - 12} ${y + 14} ${x} ${y} C${x + 12} ${y - 14} ${x + 24} ${y + 14} ${x + 36} ${y}`} />
                <path d={`M${x - 18} ${y - 7} C${x - 14} ${y - 15} ${x - 6} ${y - 13} ${x - 9} ${y - 7}`} opacity="0.8" />
                <path d={`M${x + 18} ${y + 7} C${x + 14} ${y + 15} ${x + 6} ${y + 13} ${x + 9} ${y + 7}`} opacity="0.8" />
              </g>
            ))}

            {/* A pair of Lakshmi feet in one quarter */}
            {[[c * 0.42, c * 1.5], [c * 0.42 + 18, c * 1.5 - 4]].map(([x, y], i) => (
              <g key={`f${i}`}>
                <path d={`M${x} ${y} C${x + 7} ${y - 2} ${x + 8} ${y + 14} ${x + 1} ${y + 18} C${x - 6} ${y + 14} ${x - 6} ${y - 2} ${x} ${y} Z`} />
                {[-6, -3, 0, 3, 6].map((dx, k) => (
                  <circle key={k} cx={x + dx} cy={y - 5 - Math.abs(dx) * 0.3} r={k === 0 ? 1.8 : 1.2} fill="currentColor" stroke="none" />
                ))}
              </g>
            ))}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jhoti-pattern)" />
    </svg>
  )
}
