const fs = require("fs");

const baseDir = "./";

const randValue = Math.round(Math.random() * 10000);

function fmt(n) {
  let result = n.toString();
  // Stay clear of the left-pad chaos!
  while (result.length < 6) {
    result = "0" + result;
  }
  return result;
}

function generateComponents(n, deterministic) {
  for (let i = 1; i <= n; i++) {
    const me = fmt(i);
    const left = fmt(2 * i);
    const right = fmt(2 * i + 1);

    let ts = `// Code generated by angular2-stress-test

import { Component, Input } from '@angular/core';\n`;

    ts += `
@Component({
  selector: 'my-comp-${me}',
  template: \`<div>
    <span>component {{myName}}, parent is {{parentName}}</span>`;

    if(! deterministic) {
      ts += `
    <small>[${ randValue }]</small>`;
    }

    ts += `
    <div style="padding-left: 5px">`;

    if (left <= n) {
      ts += `
      <my-comp-${left} [parentName]="myName"></my-comp-${left}>`;
    }
    if (right <= n) {
      ts += `
      <my-comp-${right} [parentName]="myName"></my-comp-${right}>`;
    }

    ts += `
    </div></div>
  \`
})
export class GeneratedComponent${me} {
  @Input() parentName: string;
  myName: string = "${me}";
`;

  if(! deterministic) {
    ts += `
  // Random variable to make this component different on each generation
  variable${ randValue }: number = ${ randValue };
`;
  }
    ts += `}
`;

    const componentFileName = `${baseDir}component${me}.ts`;
    fs.writeFileSync(componentFileName, ts);
  }
}

function generateAppComponent(n) {
  const ts = `// Code generated by angular2-stress-test

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Angular App with ${n+1} components</h1><my-comp-${fmt(1)}></my-comp-${fmt(1)}>'
})
export class AppComponent { }
`;

  fs.writeFileSync(baseDir + "app.component.ts", ts);
}

function generateAppModule(n) {
  let ts = `// Code generated by angular2-stress-test

import { NgModule }       from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { AppComponent }   from './app.component';

`;
  for (let i = 1; i <= n; i++) {
    const me = fmt(i);
    ts += `import { GeneratedComponent${me} } from "./component${me}";\n`;
  }
  ts += `

@NgModule({
  declarations: [`;

  for (let i = 1; i <= n; i++) {
    const me = fmt(i);
    ts += `\n    GeneratedComponent${me},`;
  }
  ts += `
    AppComponent
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
`;

  fs.writeFileSync(baseDir + "app.module.ts", ts);
}

function generate(nModules, nComponents, deterministic) {
  if(nModules !== 1) {
    console.error('>1 module support not yet ready');
    process.exit(2);
  }
  generateComponents(nComponents, deterministic);
  generateAppComponent(nComponents);
  generateAppModule(nComponents);
}

module.exports = generate;
