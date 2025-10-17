/**
 * Lighthouse Performance Testing Script
 *
 * このスクリプトはLighthouseを使用してアプリケーションのパフォーマンスを計測します。
 * 設計書の目標値: Performance 90以上、FCP 1.5秒以内
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// 計測対象のURL（環境変数から取得、デフォルトはローカルホスト）
const TARGET_URL = process.env.LIGHTHOUSE_URL || 'http://localhost:3000';

// Lighthouseの設定
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
};

// パフォーマンス目標値
const PERFORMANCE_THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  fcp: 1500, // First Contentful Paint (ms)
  lcp: 2500, // Largest Contentful Paint (ms)
  tti: 3800, // Time to Interactive (ms)
  tbt: 200,  // Total Blocking Time (ms)
  cls: 0.1,  // Cumulative Layout Shift
};

async function launchChromeAndRunLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options, lighthouseConfig);

    // レポートをファイルに保存
    const reportJson = runnerResult.report;
    const reportDir = path.join(__dirname, '../.lighthouse-reports');

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const reportPath = path.join(reportDir, `report-${timestamp}.json`);
    fs.writeFileSync(reportPath, reportJson);

    console.log(`\n📊 Lighthouse Report saved to: ${reportPath}\n`);

    // スコアを抽出
    const results = JSON.parse(reportJson);
    const categories = results.categories;
    const audits = results.audits;

    // スコア表示
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 Lighthouse Scores');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      'best-practices': Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    };

    for (const [category, score] of Object.entries(scores)) {
      const threshold = PERFORMANCE_THRESHOLDS[category];
      const status = score >= threshold ? '✅' : '❌';
      const label = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
      console.log(`${status} ${label}: ${score} (目標: ${threshold})`);
    }

    // Core Web Vitals
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ Core Web Vitals');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const metrics = {
      fcp: audits['first-contentful-paint']?.numericValue,
      lcp: audits['largest-contentful-paint']?.numericValue,
      tti: audits['interactive']?.numericValue,
      tbt: audits['total-blocking-time']?.numericValue,
      cls: audits['cumulative-layout-shift']?.numericValue,
    };

    for (const [metric, value] of Object.entries(metrics)) {
      const threshold = PERFORMANCE_THRESHOLDS[metric];
      const metricValue = metric === 'cls' ? value.toFixed(3) : Math.round(value);
      const metricUnit = metric === 'cls' ? '' : 'ms';
      const thresholdUnit = metric === 'cls' ? '' : 'ms';
      const status = value <= threshold ? '✅' : '❌';
      const label = metric.toUpperCase();
      console.log(`${status} ${label}: ${metricValue}${metricUnit} (目標: ≤${threshold}${thresholdUnit})`);
    }

    // 失敗した監査項目の表示
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 改善推奨項目');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const failedAudits = Object.entries(audits)
      .filter(([_, audit]) => audit.score !== null && audit.score < 0.9)
      .sort((a, b) => a[1].score - b[1].score)
      .slice(0, 5);

    if (failedAudits.length === 0) {
      console.log('✨ 全ての監査項目が基準を満たしています！');
    } else {
      failedAudits.forEach(([id, audit], index) => {
        const score = Math.round(audit.score * 100);
        console.log(`${index + 1}. ${audit.title} (スコア: ${score})`);
        if (audit.description) {
          console.log(`   ${audit.description}`);
        }
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 目標達成の判定
    const performancePassed = scores.performance >= PERFORMANCE_THRESHOLDS.performance;
    const fcpPassed = metrics.fcp <= PERFORMANCE_THRESHOLDS.fcp;

    if (performancePassed && fcpPassed) {
      console.log('🎉 パフォーマンス目標を達成しました！');
      process.exit(0);
    } else {
      console.log('⚠️  パフォーマンス目標を達成できませんでした。');
      console.log('   上記の改善推奨項目を確認してください。');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Lighthouse実行エラー:', error);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

// メイン実行
console.log(`\n🚀 Lighthouse Performance Test\n`);
console.log(`Target URL: ${TARGET_URL}\n`);

launchChromeAndRunLighthouse(TARGET_URL);
