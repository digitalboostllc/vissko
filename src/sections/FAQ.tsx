import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Combien de temps dure la batterie ?",
    answer: "La batterie de 1800mAh offre jusqu'à 12 heures d'autonomie à la vitesse la plus basse, et environ 3-4 heures à la vitesse maximale. L'écran LED vous indique toujours le pourcentage exact restant."
  },
  {
    question: "Combien de temps faut-il pour le recharger ?",
    answer: "Grâce à son port USB-C et à la charge rapide, il se recharge complètement en seulement 2.5 heures."
  },
  {
    question: "Est-ce qu'il est bruyant ?",
    answer: "Non. Il est équipé d'un moteur brushless ultra-silencieux (moins de 25dB en vitesse 1), parfait pour l'utiliser au bureau, dans les transports ou en dormant."
  },
  {
    question: "Comment fonctionne le mode tour de cou ?",
    answer: "Le ventilateur est livré avec une lanière ajustable incluse. Il suffit de l'attacher aux encoches prévues et vous pouvez porter le ventilateur autour du cou, laissant vos mains totalement libres."
  },
  {
    question: "Est-ce qu'il est lourd ?",
    answer: "Pas du tout ! Il ne pèse que 145 grammes. Vous oublierez presque que vous l'avez autour du cou ou dans votre sac."
  },
  {
    question: "Quelles sont les conditions de livraison ?",
    answer: "La livraison est gratuite en France métropolitaine pour toute commande passée aujourd'hui. L'expédition se fait rapidement et la livraison prend généralement entre 10 et 15 jours ouvrés. Vous recevrez un numéro de suivi dès l'expédition."
  },
  {
    question: "Puis-je l'utiliser pendant qu'il charge ?",
    answer: "Oui, vous pouvez continuer à profiter de la fraîcheur du Vissko même lorsqu'il est branché sur une batterie externe ou un ordinateur."
  }
]

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Questions Fréquentes</h2>
          <p className="text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur le ventilateur Vissko.
          </p>
        </div>

        {/* @ts-ignore */}
        <Accordion type={"single" as any} collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-foreground/80 py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
