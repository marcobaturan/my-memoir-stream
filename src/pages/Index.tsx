import { Layout } from "@/components/Layout";
import { EntryFeed } from "@/components/EntryFeed";

const Index = () => {
  return (
    <Layout>
      <div className="overflow-y-auto h-screen">
        <EntryFeed />
      </div>
    </Layout>
  );
};

export default Index;
