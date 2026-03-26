export default function Avatar({ src, name, size = 'md', active = false, border = false }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-24 h-24' }
  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase() : '?'

  return (
    <div className={`relative ${sizes[size]}`}>
      <div
        className={`
          ${sizes[size]} rounded-full overflow-hidden flex items-center justify-center
          bg-surface-container-high text-primary font-bold text-sm
          ${border ? 'border-2 border-primary/40' : ''}
        `}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-mono text-xs">{initials}</span>
        )}
      </div>
      {active && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface-container-low rounded-full" />
      )}
    </div>
  )
}
