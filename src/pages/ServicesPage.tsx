import ServiceActionCard from '../components/ui/ServiceActionCard'
import { serviceCards, servicesNotice } from '../data/services'

function ServicesPage() {
  return (
    <div className="page-stack">
      <section className="panel notice-bar">
        <span className="notice-dot" aria-hidden="true" />
        <p>{servicesNotice}</p>
      </section>

      <section className="hero-copy">
        <h2>创建增长任务</h2>
        <p>选择你需要的增长动作，MangoGrowth 用真实的加密用户帮你执行。</p>
      </section>

      <section className="grid-three">
        {serviceCards.map((service) => (
          <ServiceActionCard key={service.title} {...service} />
        ))}
      </section>
    </div>
  )
}

export default ServicesPage
