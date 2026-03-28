import CardPanel from '../../../components/CardPanel';

export default function ProfileSummaryCard({ profile }) {
  if (!profile) {
    return null;
  }

  return (
    <CardPanel title="Profile Snapshot" subtitle="Your core account identity from the secure backend profile.">
      <div className="stack">
        <div>
          <strong>{profile.name}</strong>
          <p className="helper-text">{profile.email}</p>
        </div>
        <div className="list-row">
          <span>Role</span>
          <strong>{profile.role}</strong>
        </div>
        <div className="list-row">
          <span>User ID</span>
          <strong>{profile.id}</strong>
        </div>
      </div>
    </CardPanel>
  );
}
