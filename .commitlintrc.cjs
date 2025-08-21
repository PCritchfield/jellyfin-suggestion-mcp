module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [(commit) => commit.includes('[skip ci]')],
  rules: {
    "type-enum": [
      2,
      "always",
      ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'release']
    ],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 200]
  }
};