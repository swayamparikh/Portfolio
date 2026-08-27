import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-cream py-16 border-t border-mocha/5 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-[40ch]">
          <span className="font-serif text-2xl font-semibold block mb-4 text-mocha">Ethos Roast</span>
          <p className="text-sm text-mocha/60 leading-relaxed">
            An artisanal collective dedicated to the heritage of coffee. Proudly sourced and roasted in small batches across India.
          </p>
          <form className="mt-6 flex gap-2 max-w-xs" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-paper border border-mocha/10 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-honey"
            />
            <button className="bg-honey text-cream px-4 py-2 rounded-sm text-sm font-medium hover:brightness-110 transition-all">
              Join
            </button>
          </form>
        </div>
        <div className="flex flex-wrap gap-16">
          <div className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-mocha/40">Explore</p>
            <ul className="text-sm space-y-2">
              <li><Link to="/menu" className="hover:text-honey">Menu</Link></li>
              <li><Link to="/about" className="hover:text-honey">Our Story</Link></li>
              <li><Link to="/gallery" className="hover:text-honey">Gallery</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-mocha/40">Business</p>
            <ul className="text-sm space-y-2">
              <li><Link to="/franchise" className="hover:text-honey">Franchise</Link></li>
              <li><Link to="/contact" className="hover:text-honey">Contact</Link></li>
              <li><a href="https://wa.me/919999999999" className="hover:text-honey">WhatsApp</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-mocha/40">Social</p>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-honey">Instagram</a></li>
              <li><a href="#" className="hover:text-honey">LinkedIn</a></li>
              <li><a href="#" className="hover:text-honey">YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-mocha/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-mocha/40">
        <p>© {new Date().getFullYear()} Ethos Roast Collective</p>
        <p>Handcrafted in India</p>
      </div>
    </footer>
  );
}
