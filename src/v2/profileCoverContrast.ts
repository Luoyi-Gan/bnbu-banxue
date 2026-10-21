/** Compare black and white against the sampled background using relative luminance. */
export function coverForeground(samples:readonly (readonly number[])[]):'#000000'|'#ffffff'{
  if(!samples.length)return '#000000'
  const linear=(value:number)=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}
  const luminance=samples.reduce((sum,[r,g,b])=>sum+.2126*linear(r)+.7152*linear(g)+.0722*linear(b),0)/samples.length
  return (luminance+.05)/.05>=1.05/(luminance+.05)?'#000000':'#ffffff'
}
