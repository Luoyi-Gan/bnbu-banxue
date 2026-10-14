import './displayAvatar.css'

export function DisplayAvatar({name, avatar, className}: {name: string; avatar?: string; className: string}) {
  return <span className={`${className} v2-display-avatar`} aria-hidden="true">
    {avatar ? <img src={avatar} alt=""/> : name.slice(0, 1)}
  </span>
}
