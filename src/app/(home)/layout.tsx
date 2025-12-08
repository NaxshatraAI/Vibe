import { Navbar } from "@/modules/home/ui/components/navbar";
import Footer from "@/components/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  
  return (
    <main className="relative flex flex-col min-h-screen w-full overflow-hidden">
      <Navbar />
      <div >
        {children}
      </div>
<Footer/>
    </main>
  );
};

export default Layout;
