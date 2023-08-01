import { logger, Tree } from '@nx/devkit';

const gitIgnoreEntries = `# Ignore Gradle project-specific cache directory
.gradle

# Ignore Gradle build output directory
build`;

export function addGitIgnoreEntry(host: Tree) {
  if (host.exists('.gitignore')) {
    let content = host.read('.gitignore', 'utf-8');
    if (!content.includes('.gradle')) {
      content = `${content}\n${gitIgnoreEntries}\n`;
      host.write('.gitignore', content);
    }
  } else {
    logger.warn(`Couldn't find .gitignore file to update`);
  }
}

const gitAttributesEntries = `#
# https://help.github.com/articles/dealing-with-line-endings/
#
# Linux start script should use lf
/gradlew        text eol=lf

# These are Windows script files and should use crlf
*.bat           text eol=crlf`;

export function addGitAttributesEntry(host: Tree) {
  if (host.exists('.gitattributes')) {
    let content = host.read('.gitattributes', 'utf-8');
    if (!content.includes('/gradlew ')) {
      content = `${content}\n${gitAttributesEntries}\n`;
      host.write('.gitattributes', content);
    }
  } else {
    host.write('.gitattributes', gitAttributesEntries);
  }
}