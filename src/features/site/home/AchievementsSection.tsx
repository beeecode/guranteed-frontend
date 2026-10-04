import { DoodleRuler, PlayfulBadge, StatBadge } from './HomeDecor';

/** Stats — achievement sticker badges */
export function AchievementsSection() {
  return (
    <section className="py-16 relative" style={{ borderTop: '1px solid rgba(217,198,178,0.3)', borderBottom: '1px solid rgba(217,198,178,0.3)' }}>
      <DoodleRuler size={100} style={{ position: 'absolute', top: 12, right: 40, opacity: 0.5, transform: 'rotate(-5deg)' }} />
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex justify-center mb-6">
          <PlayfulBadge>Our Achievements</PlayfulBadge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          <StatBadge value="850+" label="Happy Students" emoji="🧒" />
          <StatBadge value="98%" label="Pass Rate" emoji="🏆" />
          <StatBadge value="45+" label="Great Teachers" emoji="👩‍🏫" />
          <StatBadge value="20 Yrs" label="Of Excellence" emoji="⭐" />
        </div>
      </div>
    </section>
  );
}
