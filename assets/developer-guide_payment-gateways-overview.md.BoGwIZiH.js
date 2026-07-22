import{_ as a,o as e,c as i,a3 as n}from"./chunks/framework.BveOjhN0.js";const c=JSON.parse('{"title":"Payment Gateway Architecture","description":"","frontmatter":{"head":[["meta",{"property":"og:title","content":"Payment Gateway Architecture | SaleOS Docs"}],["meta",{"property":"og:description","content":"Official documentation for the SaleOS SaaS Platform."}],["meta",{"property":"og:url","content":"https://docs.saleos.app/developer-guide/payment-gateways-overview"}],["meta",{"property":"og:image","content":"https://docs.saleos.app/og-image.svg"}],["meta",{"name":"twitter:card","content":"summary_large_image"}],["meta",{"name":"twitter:title","content":"Payment Gateway Architecture | SaleOS Docs"}],["meta",{"name":"twitter:description","content":"Official documentation for the SaleOS SaaS Platform."}],["meta",{"name":"twitter:image","content":"https://docs.saleos.app/og-image.svg"}],["link",{"rel":"canonical","href":"https://docs.saleos.app/developer-guide/payment-gateways-overview"}]]},"headers":[],"relativePath":"developer-guide/payment-gateways-overview.md","filePath":"developer-guide/payment-gateways-overview.md","lastUpdated":1784733008000}'),t={name:"developer-guide/payment-gateways-overview.md"};function l(p,s,r,E,h,d){return e(),i("div",null,[...s[0]||(s[0]=[n(`<h1 id="payment-gateway-architecture" tabindex="-1">Payment Gateway Architecture <a class="header-anchor" href="#payment-gateway-architecture" aria-label="Permalink to &quot;Payment Gateway Architecture&quot;">​</a></h1><p>Gateway-agnostic payment infrastructure for SaleOS Central. The <strong>Billing Engine talks only to <code>PaymentGatewayInterface</code></strong>. Stripe and Laravel Cashier live exclusively inside <code>StripeGateway</code>.</p><h2 id="components" tabindex="-1">Components <a class="header-anchor" href="#components" aria-label="Permalink to &quot;Components&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Piece</th><th>Role</th></tr></thead><tbody><tr><td><code>PaymentGatewayInterface</code></td><td>Contract: checkout, refunds, webhooks, test connection, capabilities, currencies</td></tr><tr><td><code>GatewayManager</code></td><td>Resolves drivers by <code>payment_gateways.code</code>; binds encrypted config onto the driver</td></tr><tr><td><code>BillingEngine</code></td><td>Purchase / consolidate / handle normalized <code>GatewayEvent</code> — <strong>no Stripe/Cashier imports</strong></td></tr><tr><td><code>StripeGateway</code></td><td>Cashier Checkout + Stripe SDK + webhook normalization</td></tr><tr><td><code>CreemGateway</code></td><td>Creem REST (HTTP client) + webhook normalization</td></tr><tr><td><code>ManualGateway</code></td><td>Synchronous offline settlement</td></tr><tr><td><code>PaymentGatewayService</code></td><td>Admin enable/disable/default/config/mode/test/logs</td></tr><tr><td><code>GatewayWebhookController</code></td><td><code>POST /webhooks/gateways/{code}</code> → driver → Billing Engine</td></tr><tr><td><code>StripeWebhookController</code></td><td>Cashier-compatible <code>/stripe/webhook</code> + Billing Engine dispatch</td></tr></tbody></table><h2 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h2><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">flowchart TB</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  subgraph AdminUI[&quot;Central Billing UI&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    PG[Payment Gateways]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    INV[Invoices / Payments]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  subgraph API[&quot;Central API&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    PGC[PaymentGatewayController]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IC[Invoice / Payment Controllers]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  subgraph Engine[&quot;Billing Engine&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    BE[BillingEngine]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    GM[GatewayManager]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    IF[PaymentGatewayInterface]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  subgraph Drivers[&quot;Drivers&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    MG[ManualGateway]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    SG[StripeGateway]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    CG[CreemGateway]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  subgraph Providers[&quot;External&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Stripe[Stripe API / Cashier]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Creem[Creem API]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PG --&gt; PGC</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  INV --&gt; IC</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PGC --&gt; PaymentGatewayService</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  IC --&gt; BE</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  BE --&gt; GM</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  GM --&gt; IF</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  IF --&gt; MG</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  IF --&gt; SG</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  IF --&gt; CG</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  SG --&gt; Stripe</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  CG --&gt; Creem</span></span></code></pre></div><h2 id="checkout-activation-sequence" tabindex="-1">Checkout / activation sequence <a class="header-anchor" href="#checkout-activation-sequence" aria-label="Permalink to &quot;Checkout / activation sequence&quot;">​</a></h2><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sequenceDiagram</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  participant WS as Workspace / Admin</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  participant BE as BillingEngine</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  participant GM as GatewayManager</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  participant D as PaymentGatewayInterface</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  participant WH as Webhook</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  participant LE as Ledger</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  WS-&gt;&gt;BE: purchaseModule(tenant, module)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  BE-&gt;&gt;GM: driver(default)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  GM-&gt;&gt;D: createCheckout(request)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  alt manual</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    D--&gt;&gt;BE: succeeded</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    BE-&gt;&gt;LE: invoice + payment succeeded</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    BE-&gt;&gt;BE: activate subscription</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  else external (e.g. Stripe)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    D--&gt;&gt;BE: pending + redirect URL</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    WS-&gt;&gt;D: complete checkout at provider</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    WH-&gt;&gt;D: parseWebhook(payload)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    D--&gt;&gt;BE: GatewayEvent(payment_succeeded, tenantId)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    BE-&gt;&gt;LE: mark payment succeeded</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    BE-&gt;&gt;BE: activate pending subscription</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span></code></pre></div><h2 id="er-gateway-agnostic" tabindex="-1">ER (gateway-agnostic) <a class="header-anchor" href="#er-gateway-agnostic" aria-label="Permalink to &quot;ER (gateway-agnostic)&quot;">​</a></h2><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">erDiagram</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS ||--o{ PAYMENT_METHODS : stores</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS ||--o{ PAYMENTS : processes</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS ||--o{ PAYMENT_ATTEMPTS : attempts</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS ||--o{ GATEWAY_LOGS : audits</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS ||--o{ WEBHOOK_LOGS : receives</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS ||--o{ PAYMENT_GATEWAY_MODULE_PRICES : maps</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  MODULES ||--o{ PAYMENT_GATEWAY_MODULE_PRICES : priced_as</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  TENANTS ||--o{ PAYMENT_METHODS : prefers</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  TENANTS ||--o{ PAYMENTS : owns</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  INVOICES ||--o{ PAYMENTS : settled_by</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENTS ||--o{ PAYMENT_TRANSACTIONS : trails</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENTS ||--o{ PAYMENT_ATTEMPTS : retries</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAYS {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string code UK</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string driver</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bool is_active</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bool is_default</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string mode</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    text config &quot;encrypted:array&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    json capabilities</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string webhook_status</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_GATEWAY_MODULE_PRICES {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    int payment_gateway_id</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    int module_id</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string billing_cycle</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string gateway_product_reference</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string gateway_price_reference</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  PAYMENT_METHODS {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    string tenant_id</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    bool is_default</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    text token &quot;encrypted&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span></code></pre></div><blockquote><p><code>payment_methods</code> <strong>is</strong> the workspace preferred-method table (<code>tenant_id</code> + <code>is_default</code>). No separate <code>workspace_payment_methods</code> table.</p></blockquote><h2 id="product-mapping" tabindex="-1">Product mapping <a class="header-anchor" href="#product-mapping" aria-label="Permalink to &quot;Product mapping&quot;">​</a></h2><p>Gateways with <code>checkout</code> + <code>subscriptions</code> capabilities (<code>requiresProductMapping()</code>) store provider product/price references in <code>payment_gateway_module_prices</code>. Modules never store Stripe (or any provider) IDs.</p><p>Admin API: <code>GET/PUT /payment-gateways/{id}/module-prices</code>. Central UI: <strong>Billing → Payment Gateways → Product mapping</strong>.</p><h2 id="adding-a-new-gateway" tabindex="-1">Adding a new gateway <a class="header-anchor" href="#adding-a-new-gateway" aria-label="Permalink to &quot;Adding a new gateway&quot;">​</a></h2><ol><li>Implement <code>App\\Billing\\Drivers\\{Name}Gateway extends AbstractGateway</code>.</li><li>Register in <code>config/core-platform.php</code> → <code>payment_gateways</code>.</li><li>Seed a <code>payment_gateways</code> row (<code>code</code>, <code>driver</code>, capabilities, currencies).</li><li>If the gateway needs provider price IDs, implement mapping via <code>payment_gateway_module_prices</code> (no Module schema changes).</li><li>Point provider webhooks to <code>POST /webhooks/gateways/{code}</code>.</li><li><strong>Do not</strong> change <code>BillingEngine</code> or Module catalog fields.</li></ol><h2 id="related-docs" tabindex="-1">Related docs <a class="header-anchor" href="#related-docs" aria-label="Permalink to &quot;Related docs&quot;">​</a></h2><ul><li><a href="/developer-guide/payment-gateways">Developer guide</a></li><li><a href="/user-guide/payment-gateways">User guide</a></li><li><a href="/deployment/payment-gateways">Production guide</a></li><li><a href="/developer-guide/payment-gateways-webhooks">Webhook reference</a></li><li><a href="/developer-guide/billing-engine">Billing Engine</a></li><li><a href="/developer-guide/stripe-cashier">Stripe / Cashier notes</a></li><li><a href="/developer-guide/creem">Creem gateway</a></li></ul>`,18)])])}const k=a(t,[["render",l]]);export{c as __pageData,k as default};
