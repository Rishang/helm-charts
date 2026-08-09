import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import HomepageFeatures from '../components/HomepageFeatures';

export default function Home(): React.ReactElement {
  return (
    <Layout title="Docs" description="Helm chart documentation for helm-charts">
      <header className="heroBanner">
        <div className="container">
          <h1 className="heroTitle">helm-charts</h1>
          <p className="heroSubtitle">
            A docs UI for the Helm charts in this repository. Start with{' '}
            <Link to="/component-chart/introduction">component-chart</Link> or{' '}
            <Link to="/loki-stack/usage">loki-stack</Link>.
          </p>
          <div className="margin-top--md">
            <Link className="button button--primary button--lg" to="/component-chart/introduction">
              Open component-chart docs
            </Link>
            <span style={{ marginLeft: 12 }} />
            <Link className="button button--secondary button--lg" to="/loki-stack/usage">
              Open loki-stack docs
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

