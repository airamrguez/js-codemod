// Press ctrl+space for code completion
export default function transformer(file, api) {
  const j = api.jscodeshift;

  function getImportSpecifiers(j, imports) {
    return imports.map(name => {
      return j.importSpecifier(j.identifier(name));
    });
  }

  function isImport(node, imported) {
    return (
      node.type === 'ImportDeclaration' &&
      node.source.value.indexOf(imported) === 0
    );
  }

  function isLodashImport(node) {
    return isImport(node, 'lodash.');
  }

  function reduceImports(imports, imported) {
    return imported;
  }

  const ast = j(file.source);
  const importDeclaration = j.importDeclaration([], j.literal('lodash-es'));
  ast
    .find(j.ImportDeclaration, isLodashImport)
    .forEach((node) => {
      const imported = j(node);
      imported
        .find(j.ImportDefaultSpecifier, {
          type: 'ImportDefaultSpecifier'
        })
        .forEach(n => {
          const specifier = j(n);
          specifier.find(j.Identifier, {
            type: 'Identifier'
          }).forEach(iden => {
            importDeclaration.specifiers.push(j.importSpecifier(j.identifier(iden.node.name)));

          });
        });
    })
    .remove();

  ast.get().value.program.body.unshift(importDeclaration);

  return ast.toSource({
    arrowParensAlways: true,
    quote: 'single',
  });
}
