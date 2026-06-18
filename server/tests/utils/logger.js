const chalk = require('chalk');

let total = 0;
let passed = 0;
let failed = 0;

const reset = () => { total = 0; passed = 0; failed = 0; };

const ok = (label, detail = '') => {
  total++; passed++;
  console.log(chalk.green(`  ✓ ${label}`) + (detail ? chalk.gray(`  ${detail}`) : ''));
};

const fail = (label, detail = '') => {
  total++; failed++;
  console.log(chalk.red(`  ✗ ${label}`) + (detail ? chalk.yellow(`  ${detail}`) : ''));
};

const info = (msg) => console.log(chalk.blue(`  ℹ ${msg}`));

const section = (title) => {
  console.log('');
  console.log(chalk.cyan.bold(`▶ ${title}`));
  console.log(chalk.cyan('─'.repeat(60)));
};

const summary = () => {
  console.log('');
  console.log(chalk.white.bold('═'.repeat(60)));
  console.log(chalk.white.bold('  测试报告'));
  console.log(chalk.white.bold('═'.repeat(60)));
  console.log(chalk.white(`  总计: ${total}  |  `) + chalk.green(`通过: ${passed}`) + chalk.white('  |  ') + chalk.red(`失败: ${failed}`));
  if (failed === 0) {
    console.log(chalk.green.bold('\n  ✓ 全部测试通过\n'));
  } else {
    console.log(chalk.red.bold(`\n  ✗ ${failed} 项测试失败\n`));
  }
  console.log(chalk.white.bold('═'.repeat(60)));
};

const assert = (condition, label, detail) => {
  if (condition) ok(label, detail);
  else fail(label, detail);
  return condition;
};

module.exports = { reset, ok, fail, info, section, summary, assert };
