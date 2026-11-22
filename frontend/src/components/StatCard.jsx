export default function StatCard({ icon: Icon, label, value, note }) {
  return (
    <article className="stat">
      <div><Icon size={16} /><span>{label}</span></div>
      <b>{value}</b>
      <small>{note}</small>
    </article>
  );
}
