export const AsSeenOn = () => {
  return (
    <section className="py-10 border-b border-zinc-200 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
          Ils parlent de nous
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale">
          {/* Mock Logos - purely CSS/Text for clean flat design without external images */}
          <div className="text-2xl font-black font-serif tracking-tighter">Le Monde</div>
          <div className="text-3xl font-black tracking-tighter">GQ</div>
          <div className="text-xl font-black uppercase tracking-widest border-2 border-current px-2">TechRadar</div>
          <div className="text-2xl font-black tracking-tighter">BFMTV</div>
          <div className="text-xl font-bold font-serif italic">Vogue</div>
        </div>
      </div>
    </section>
  )
}
