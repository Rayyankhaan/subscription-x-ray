import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav>
        <div className="wrap navrow">
          <div className="brand">subscription x-ray</div>
          <div className="navlinks">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </nav>

      <main>
        <div className="wrap">
          <div className="hero">
            <div>
              <h1>See what&apos;s quietly leaving your account every month.</h1>
              <p className="lede">
                Upload a bank or card statement. Subscription X-Ray finds every
                recurring charge, the ones you remember and the ones you forgot,
                in seconds, entirely in your browser.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/scanner">
                  Scan my statements — ₹69
                </Link>
                <a className="btn btn-ghost" href="#pricing">See pricing</a>
              </div>
              <div className="trust">
                Your statement is never uploaded to a server — it&apos;s read locally,
                in your browser.
              </div>
            </div>

            <div className="hero-card">
              <div className="statline">
                <div className="figure">₹3,847<small>found leaving your account monthly</small></div>
              </div>
              {[
                ["Netflix", "₹649/mo", ""],
                ["Cult.fit", "₹999/mo", ""],
                ["Unnamed SaaS tool", "₹1,999/mo", "unrecognised"],
                ["Spotify", "₹119/mo", ""],
                ["Google One", "₹130/mo", ""],
              ].map(([name, amount, tag]) => (
                <div className="row" key={name}>
                  <span>{name} {tag && <span className="tag">{tag}</span>}</span>
                  <span>{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="how">
          <div className="wrap">
            <p className="eyebrow">How it works</p>
            <h2>Three steps to see everything recurring</h2>
            <div className="steps">
              <div className="step"><div className="n">01</div><h3>Create an account & pay once</h3><p>₹69 unlocks 12 scans — check every card, every month, whenever you want.</p></div>
              <div className="step"><div className="n">02</div><h3>Drop in your statement</h3><p>The file is parsed locally in your browser. It&apos;s never sent anywhere.</p></div>
              <div className="step"><div className="n">03</div><h3>See what&apos;s recurring</h3><p>Every repeating charge is listed with amount, frequency, and a direct link to manage or cancel it.</p></div>
            </div>
          </div>
        </section>

        <section id="pricing">
          <div className="wrap">
            <p className="eyebrow">Pricing</p>
            <h2>One payment. Twelve scans.</h2>
            <p className="lede">No subscription, nothing recurring on our side — pay once, get a pack of scans to use whenever you need them.</p>
            <div className="pricing pricing-single">
              <div className="plan featured">
                <div className="name">12-scan pack</div>
                <div className="price">₹69<span> one-time</span></div>
                <ul>
                  <li>12 statement scans, use anytime — this month, next month, whenever</li>
                  <li>Check every card and account you have, not just one</li>
                  <li>Cancellation links for known services</li>
                  <li>Runs entirely in your browser — nothing uploaded</li>
                  <li>Out of scans? Buy another 12-pack for ₹69, any time</li>
                </ul>
                <Link className="btn btn-primary full" href="/scanner">Create account & pay ₹69</Link>
                <p className="small-note">Each payment adds 12 scans to your account — they don&apos;t expire.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="wrap">
            <p className="eyebrow">FAQ</p>
            <h2>Common questions</h2>
            <div className="faq">
              <div className="faq-item"><h3>Is my statement actually private?</h3><p>CSV parsing happens with JavaScript in your browser. The raw file is never sent to a server.</p></div>
              <div className="faq-item"><h3>What do I get for ₹69?</h3><p>12 scans on your account, usable whenever — check your own cards, a family member&apos;s statement, or the same account again next month. They don&apos;t expire.</p></div>
              <div className="faq-item"><h3>Can it cancel subscriptions automatically?</h3><p>Not yet. It identifies recurring charges and gives direct management links for recognized services.</p></div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        Subscription X-Ray · Built to find money you forgot you were spending.
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refunds</Link>
        </div>
      </footer>
    </>
  );
}
