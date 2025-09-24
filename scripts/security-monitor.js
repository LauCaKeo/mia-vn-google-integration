#!/usr/bin/env node

/**
 * Security Monitoring Script
 * Automated security checks and monitoring
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class SecurityMonitor {
  constructor() {
    this.reportPath = path.join(__dirname, '..', 'security-reports');
    this.ensureReportDirectory();
  }

  ensureReportDirectory() {
    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }
  }

  async runSecurityAudit() {
    console.log('🔍 Running security audit...');

    try {
      const { stdout, stderr } = await execPromise('npm audit --audit-level=moderate --json');
      const auditResult = JSON.parse(stdout);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(this.reportPath, `security-audit-${timestamp}.json`);

      fs.writeFileSync(reportFile, JSON.stringify(auditResult, null, 2));

      console.log('✅ Security audit completed');
      console.log(`📋 Report saved: ${reportFile}`);

      return this.analyzeSecurity(auditResult);
    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      return { vulnerabilities: [], critical: true, error: error.message };
    }
  }

  analyzeSecurity(auditResult) {
    const vulnerabilities = auditResult.vulnerabilities || {};
    const advisories = auditResult.advisories || {};

    const analysis = {
      timestamp: new Date().toISOString(),
      totalVulnerabilities: Object.keys(vulnerabilities).length,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0,
      vulnerabilities: [],
      recommendations: []
    };

    // Count vulnerabilities by severity
    Object.values(advisories).forEach(advisory => {
      const severity = advisory.severity;
      if (analysis[severity] !== undefined) {
        analysis[severity]++;
      }

      analysis.vulnerabilities.push({
        id: advisory.id,
        title: advisory.title,
        severity: advisory.severity,
        module: advisory.module_name,
        vulnerable_versions: advisory.vulnerable_versions,
        patched_versions: advisory.patched_versions,
        recommendation: advisory.recommendation
      });
    });

    // Generate recommendations
    if (analysis.critical > 0) {
      analysis.recommendations.push('🚨 URGENT: Fix critical vulnerabilities immediately');
    }
    if (analysis.high > 0) {
      analysis.recommendations.push('⚠️ High priority: Address high severity vulnerabilities');
    }
    if (analysis.moderate > 0) {
      analysis.recommendations.push('📋 Moderate: Review and fix moderate vulnerabilities');
    }
    if (analysis.totalVulnerabilities === 0) {
      analysis.recommendations.push('✅ Excellent: No vulnerabilities detected');
    }

    return analysis;
  }

  async checkDependencyUpdates() {
    console.log('📦 Checking for dependency updates...');

    try {
      const { stdout } = await execPromise('npm outdated --json');
      const outdated = JSON.parse(stdout);

      const updates = Object.entries(outdated).map(([name, info]) => ({
        package: name,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest,
        location: info.location
      }));

      console.log(`📊 Found ${updates.length} packages that can be updated`);

      if (updates.length > 0) {
        console.log('\n📋 Packages that can be updated:');
        updates.forEach(pkg => {
          console.log(`  ${pkg.package}: ${pkg.current} → ${pkg.latest}`);
        });
      }

      return updates;
    } catch (error) {
      // npm outdated returns exit code 1 when there are outdated packages
      if (error.stdout) {
        try {
          const outdated = JSON.parse(error.stdout);
          return Object.entries(outdated).map(([name, info]) => ({
            package: name,
            current: info.current,
            wanted: info.wanted,
            latest: info.latest,
            location: info.location
          }));
        } catch (parseError) {
          console.log('ℹ️ All dependencies are up to date');
          return [];
        }
      }

      console.log('ℹ️ All dependencies are up to date');
      return [];
    }
  }

  async generateSecurityReport() {
    console.log('📊 Generating comprehensive security report...');

    const auditResults = await this.runSecurityAudit();
    const updateResults = await this.checkDependencyUpdates();

    const report = {
      timestamp: new Date().toISOString(),
      security: auditResults,
      dependencies: {
        outdated: updateResults.length,
        packages: updateResults
      },
      recommendations: [
        ...auditResults.recommendations,
        updateResults.length > 0 ? '📦 Consider updating outdated dependencies' : '✅ All dependencies are current'
      ]
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.reportPath, `security-report-${timestamp}.json`);

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log('\n📋 Security Report Summary:');
    console.log(`📊 Total vulnerabilities: ${report.security.totalVulnerabilities}`);
    console.log(`🚨 Critical: ${report.security.critical}`);
    console.log(`⚠️  High: ${report.security.high}`);
    console.log(`📋 Moderate: ${report.security.moderate}`);
    console.log(`📦 Outdated packages: ${report.dependencies.outdated}`);
    console.log(`📄 Full report: ${reportFile}`);

    // Return exit code based on security status
    if (report.security.critical > 0 || report.security.high > 0) {
      process.exit(1);
    }

    return report;
  }
}

// Run security monitor if called directly
if (require.main === module) {
  const monitor = new SecurityMonitor();
  monitor.generateSecurityReport().catch(console.error);
}

module.exports = SecurityMonitor;
