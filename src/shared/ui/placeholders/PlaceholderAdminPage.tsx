// src/shared/ui/placeholders/PlaceholderAdminPage.tsx

type Props = {
  title: string;
};

export const PlaceholderAdminPage = ({ title }: Props) => {
  return (
    <section style={{ padding: '40px 20px' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <p style={{ marginBottom: 0 }}>Раздел будет реализован следующим этапом.</p>
      </div>
    </section>
  );
};
