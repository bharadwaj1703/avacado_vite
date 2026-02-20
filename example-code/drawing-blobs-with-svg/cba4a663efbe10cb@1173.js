// https://observablehq.com/@daformat/drawing-blobs-with-svg@1173
import define1 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`
# Drawing and animating blobs with svg and&nbsp;javascript
One way to create a blob shape it is to draw a circle with a bezier curve svg path ([it&nbsp;can only&nbsp;be an&nbsp;approximation of a circle](https://spencermortensen.com/articles/bezier-circle/), but&nbsp;it's good enough for our purposes). Once&nbsp;the circular path is&nbsp;drawn, we&nbsp;then can simply animate its&nbsp;anchor points and&nbsp;control points (the handles in a vector software) over&nbsp;time.

The result is a convincing enough approximation of a&nbsp;jello-like blob wiggling forever, without any other computation than transitioning the anchor points and&nbsp;control points positions.
`
)}

function _2(md){return(
md`## The blob wiggling animation
Play with settings below to change the number of anchor&nbsp;points, the&nbsp;amplitude of&nbsp;their displacement, the&nbsp;radius of the&nbsp;blob, and the&nbsp;speed of the&nbsp;animation.
`
)}

function* _blobs(radius,totalNodes,amplitudeFactor,debug,createGradient,shadow,createDropshadowFilter,createNodes,createControlPoints,appendNodes,appendControlPoints,drawBlobPath,update)
{

  /* /!\ Code is still quite messy /!\ */
  
  const boxWidth = 1000;
  const boxHeight = 520;
  const xmlns = 'http://www.w3.org/2000/svg';  
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttributeNS(null, 'viewBox', `0 0 ${boxWidth} ${boxHeight}`);
  svg.setAttributeNS(null, 'width', boxWidth);
  svg.setAttributeNS(null, 'height', boxHeight);
  svg.setAttributeNS(null, 'style', `width: 100%; height: auto; max-width: ${boxWidth}; box-sizing: border-box`);

  const centerX = boxWidth / 2;
  const centerY = boxHeight / 2;
  const offsetX = centerX - radius * 1.55;
  const offsetY = centerY - radius * 0.4;
  const offsetX2 = centerX - radius * 0.95;
  const offsetY2 = centerY - radius * 1.5;
  const offsetX3 = centerX - radius * 1.3;
  const offsetY3 = centerY - radius * 1.1;
  const amplitude = radius / Math.max(Math.min(totalNodes, 7), 4) * amplitudeFactor;
  const debugOpacity = debug ? '44' : '00';
  
  const defs = document.createElementNS(xmlns, 'defs');
  svg.appendChild(defs);
  defs.appendChild(createGradient(xmlns, 'gradient1', '#50F6C2', '#80FFF2'));
  defs.appendChild(createGradient(xmlns, 'gradient2', '#1E2CEF', '#4E5CFF'));
  defs.appendChild(createGradient(xmlns, 'gradient3', '#FF2CEFee', '#FF74FFee'));
  if (shadow) {
    defs.appendChild(createDropshadowFilter(xmlns, 'shadow1', '#80FFF2'));
    defs.appendChild(createDropshadowFilter(xmlns, 'shadow2', '#4E5CFF'));
    defs.appendChild(createDropshadowFilter(xmlns, 'shadow3', '#FF74FF'));
  }
  
  const g2 = document.createElementNS(xmlns, 'g');
  g2.setAttributeNS(null, 'transform', `scale(1.25)`);
  g2.setAttributeNS(null, 'style', `mix-blend-mode: multiply;`);
  svg.appendChild(g2);
  const path2 = document.createElementNS(xmlns, 'path');
  path2.setAttributeNS(null, 'fill', `url(${window.location.href}#gradient1)`);
  shadow && path2.setAttributeNS(null, 'style', `filter: url(${window.location.href}#shadow1)`);
  g2.appendChild(path2);
  const nodes2 = (
    this && totalNodes * radius === this.hash && this.nodes2
  ) || createNodes(radius, offsetX2, offsetY2, amplitude);
  const controlPoints2 = (
    this && totalNodes * radius === this.hash && this.controlPoints2
  ) || createControlPoints(nodes2, radius, offsetX2, offsetY2);
  appendNodes(nodes2, controlPoints2, g2, xmlns, debugOpacity);
  appendControlPoints(nodes2, controlPoints2, g2, xmlns, debugOpacity);
  
  const g3 = document.createElementNS(xmlns, 'g');
  g3.setAttributeNS(null, 'transform', `scale(0.6)`);
  g3.setAttributeNS(null, 'style', `mix-blend-mode: multiply;`);
  svg.appendChild(g3);
  const path3 = document.createElementNS(xmlns, 'path');
  path3.setAttributeNS(null, 'fill', `url(${window.location.href}#gradient3)`);
  shadow && path3.setAttributeNS(null, 'style', `filter: url(${window.location.href}#shadow3)`);
  g3.appendChild(path3);
  const nodes3 = (
    this && totalNodes * radius === this.hash && this.nodes3
  ) || createNodes(radius, offsetX3, offsetY3, amplitude);
  const controlPoints3 = (
     this && totalNodes * radius === this.hash && this.controlPoints3
  ) || createControlPoints(nodes3, radius, offsetX3, offsetY3);
  appendNodes(nodes3, controlPoints3, g3, xmlns, debugOpacity);
  appendControlPoints(nodes3, controlPoints3, g3, xmlns, debugOpacity);
  
  const g = document.createElementNS(xmlns, 'g');
  g.setAttributeNS(null, 'opacity', '0.9');
  g.setAttributeNS(null, 'style', `mix-blend-mode: multiply;`);
  svg.appendChild(g);
  const path = document.createElementNS(xmlns, 'path');
  path.setAttributeNS(null, 'fill', `url(${window.location.href}#gradient2)`);
  shadow && path.setAttributeNS(null, 'style', `filter: url(${window.location.href}#shadow2)`);
  // path.setAttributeNS(null, 'stroke', '#1F4DF0');
  // path.setAttributeNS(null, 'stroke-width', radius/20);
  g.appendChild(path);
  const nodes = (
    this && totalNodes * radius === this.hash && this.nodes
  ) || createNodes(radius, offsetX, offsetY, amplitude);
  const controlPoints = (
    this && totalNodes * radius === this.hash && this.controlPoints
  ) || createControlPoints(nodes, radius, offsetX, offsetY);
  appendNodes(nodes, controlPoints, g, xmlns, debugOpacity);
  appendControlPoints(nodes, controlPoints, g, xmlns, debugOpacity);
  drawBlobPath(nodes, controlPoints, path);
  
  // path.setAttributeNS(null, 'stroke-dashoffset', path.getTotalLength());

  // const triangle = document.createElementNS(xmlns, 'path');
  // triangle.setAttributeNS(null, 'fill', '#ffffffdd');
  // triangle.setAttributeNS(null, 'd', `M${radius / 2 + offsetX} ${0 + offsetY}L${offsetX - radius / 2 }${offsetY - radius / 2}L${offsetX - radius / 2 } ${offsetY + radius / 2}Z`);
  // triangle.setAttributeNS(null, 'transform', `translate(${radius * 1.15} ${radius * 1.15}) scale(0.75)`);
  // svg.appendChild(triangle);
  svg.nodes = nodes;
  svg.controlPoints = controlPoints;
  svg.nodes2 = nodes2;
  svg.controlPoints2 = controlPoints2;
  svg.nodes3 = nodes3;
  svg.controlPoints3 = controlPoints3;
  svg.hash = totalNodes * radius;
  
  while(true) {
    // path.setAttributeNS(null, 'stroke-dasharray', path.getTotalLength() / 12);
    // path.setAttributeNS(null, 'stroke-dashoffset', path.getAttributeNS(null, 'stroke-dashoffset') - 1);
    update(nodes, controlPoints, amplitude);
    drawBlobPath(nodes, controlPoints, path);
    update(nodes2, controlPoints2, amplitude);
    drawBlobPath(nodes2, controlPoints2, path2);
    update(nodes3, controlPoints3, amplitude);
    drawBlobPath(nodes3, controlPoints3, path3);
    yield svg;
  }
}


function _speed(slider){return(
slider({
  min: 0.5,
  max: 5,
  step: 0.1,
  value: 1,
  title: "Speed"
})
)}

function _amplitudeFactor(slider){return(
slider({
  min: 0.8,
  max: 2,
  step: 0.1,
  value: 1.2,
  title: "Amplitude"
})
)}

function _radius(slider){return(
slider({
  min: 100,
  max: 200,
  step: 1,
  value: 120,
  title: "Radius"
})
)}

function _totalNodes(slider){return(
slider({
  min: 3,
  max: 10,
  step: 1,
  value: 5,
  title: "Anchor points"
})
)}

function _shadow(checkbox){return(
checkbox({
  description: "Apply coloured shadow svg filter to the blobs",
  options: [{ value: "toggle", label: "Glow (disable for performance)" }],
  value: ""
})
)}

function _debug(checkbox){return(
checkbox({
  description: "Draw vector anchor points and control points",
  options: [{ value: "toggle", label: "Draw anchors and handles" }],
  value: ""
})
)}

function _10(md){return(
md`## Functions`
)}

function _createDropshadowFilter(){return(
function createDropshadowFilter(xmlns, id, color) {
  const filter = document.createElementNS(xmlns, 'filter');
  filter.setAttributeNS(null, 'id', id);
  filter.setAttributeNS(null, 'height', '200%');
  filter.setAttributeNS(null, 'width', '200%');
  filter.setAttributeNS(null, 'x', '-30%');
  filter.setAttributeNS(null, 'y', '-30%');
  filter.setAttributeNS(null, 'overflow', 'visible');
  
  const blur = document.createElementNS(xmlns, 'feGaussianBlur');
  blur.setAttributeNS(null, 'in', 'SourceAlpha');
  blur.setAttributeNS(null, 'stdDeviation', '16');
  blur.setAttributeNS(null, 'result', 'offsetblur');
  filter.appendChild(blur);
  
  const flood = document.createElementNS(xmlns, 'feFlood');
  flood.setAttributeNS(null, 'flood-color', color);
  flood.setAttributeNS(null, 'flood-opacity', '1');
  filter.appendChild(flood);
  // const flood2 = document.createElementNS(xmlns, 'feFlood');
  // flood2.setAttributeNS(null, 'flood-color', color);
  // flood2.setAttributeNS(null, 'flood-opacity', '1');
  // filter.appendChild(flood2);
  
  const composite = document.createElementNS(xmlns, 'feComposite');
  composite.setAttributeNS(null, 'in2', 'offsetblur');
  composite.setAttributeNS(null, 'operator', 'in');
  filter.appendChild(composite);
  
  const offset = document.createElementNS(xmlns, 'feOffset');
  offset.setAttributeNS(null, 'dx', '4');
  offset.setAttributeNS(null, 'dy', '4');
  offset.setAttributeNS(null, 'result', 'offsetblur');
  filter.appendChild(offset);
  
  const componentTransfer = document.createElementNS(xmlns, 'feComponentTransfer');
  const funcA = document.createElementNS(xmlns, 'feFuncA');
  funcA.setAttributeNS(null, 'type', 'linear');
  funcA.setAttributeNS(null, 'slope', '0.8');
  componentTransfer.appendChild(funcA);
  filter.appendChild(componentTransfer);
  
  const merge = document.createElementNS(xmlns, 'feMerge');
  const mergeNode1 = document.createElementNS(xmlns, 'feMergeNode');
  const mergeNode2 = document.createElementNS(xmlns, 'feMergeNode');
  const mergeNode3 = document.createElementNS(xmlns, 'feMergeNode');
  const mergeNode4 = document.createElementNS(xmlns, 'feMergeNode');
  mergeNode4.setAttributeNS(null, 'in', 'SourceGraphic');
  merge.appendChild(mergeNode1);
  // merge.appendChild(mergeNode2);
  // merge.appendChild(mergeNode3);
  merge.appendChild(mergeNode4);
  filter.appendChild(merge);
  
  return filter;
}
)}

function _createGradient(){return(
function createGradient(xmlns, id, color1, color2) {
  const radialGradient = document.createElementNS(xmlns, 'radialGradient');
  radialGradient.setAttributeNS(null, 'id', id);
  const stop1 = document.createElementNS(xmlns, 'stop');
  stop1.setAttributeNS(null, 'offset', '0%');
  stop1.setAttributeNS(null, 'stop-color', color1);
  radialGradient.appendChild(stop1);
  const stop2 = document.createElementNS(xmlns, 'stop');
  stop2.setAttributeNS(null, 'offset', '100%');
  stop2.setAttributeNS(null, 'stop-color', color2);
  radialGradient.appendChild(stop2);
  return radialGradient;
}
)}

function _ease(speed){return(
function ease (t) {
  return -(Math.cos(Math.PI / 2 * t * 5) - 2) / 256 * speed;
}
)}

function _rotate(){return(
function rotate(cx, cy, x, y, radians) {
    const cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
  }
)}

function _createNodes(totalNodes){return(
function createNodes (radius, offsetX, offsetY) {
  let num = totalNodes,
      nodes = [], 
      width = (radius * 2),
      height = (radius * 2),
      angle,
      x,
      y;
  for (let i = 0; i < num; i++) {
    angle = (i / (num / 2)) * Math.PI; // Angle at which the node will be placed
    x = (radius * Math.cos(angle)) + (width / 2);
    y = (radius * Math.sin(angle)) + (width / 2);
    nodes.push({
      id: i,
      x: x + offsetX,
      y: y + offsetY,
      prevX: x + offsetX,
      prevY: y + offsetY,
      nextX: x + offsetX,
      nextY: y + offsetY,
      baseX: x + offsetX,
      baseY: y + offsetY,
      angle,
      debug: {}
    });
  }
  return nodes;
}
)}

function _appendNodes(){return(
function appendNodes(nodes, controlPoints, svg, xmlns, debugOpacity) {
  nodes.forEach((n, i) => {
    const line = document.createElementNS(xmlns, 'path');
    line.setAttributeNS(null, 'stroke', `#000000${debugOpacity}`);
    line.setAttributeNS(null, 'stroke-width', '1');
    line.setAttributeNS(null, 'd', `
      M${controlPoints[n.id].c1x} ${controlPoints[n.id].c1y}
      L${controlPoints[n.id].c2x} ${controlPoints[n.id].c2y}
    `);
    svg.appendChild(line);
    nodes[i].debug.cpLine = line;

    const circle = document.createElementNS(xmlns, 'circle');
    circle.setAttributeNS(null, 'fill', `#000000${debugOpacity}`);
    circle.setAttributeNS(null, 'cx', n.x);
    circle.setAttributeNS(null, 'cy', n.y);
    circle.setAttributeNS(null, 'r', 3);
    svg.appendChild(circle);
    nodes[i].debug.node = circle;
  });
}
)}

function _createControlPoints(totalNodes,rotate){return(
function createControlPoints(nodes, radius, offsetX, offsetY) {
  // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
  const idealControlPointDistance = (4 / 3) * Math.tan(Math.PI / (2 * totalNodes)) * radius;

  const cp0 = {
    c1x: nodes[0].x,
    c1y: nodes[0].y - idealControlPointDistance,
    c2x: nodes[0].x,
    c2y: nodes[0].y + idealControlPointDistance
  };

  return nodes.map(
    (n, i) => {
      if (i === 0) {
        return cp0;
      } else {
        const angle = -n.angle;
        const rotatedC1 = rotate(radius + offsetX, radius + offsetY, cp0.c1x, cp0.c1y, angle);
        const rotatedC2 = rotate(radius + offsetX, radius + offsetY, cp0.c2x, cp0.c2y, angle);
        return {
          c1x: rotatedC1[0],
          c1y: rotatedC1[1],
          c2x: rotatedC2[0],
          c2y: rotatedC2[1]
        };
      }
    }
  );
}
)}

function _appendControlPoints(){return(
function appendControlPoints(nodes, controlPoints, svg, xmlns, debugOpacity) {
  controlPoints.forEach((n, i) => {
    const circle = document.createElementNS(xmlns, 'circle');
    circle.setAttributeNS(null, 'fill', `#000000${debugOpacity}`);
    circle.setAttributeNS(null, 'cx', n.c1x);
    circle.setAttributeNS(null, 'cy', n.c1y);
    circle.setAttributeNS(null, 'r', 2);
    svg.appendChild(circle);
    nodes[i].debug.cp1 = circle;
    
    const circle2 = document.createElementNS(xmlns, 'circle');
    circle2.setAttributeNS(null, 'fill', `#000000${debugOpacity}`);
    circle2.setAttributeNS(null, 'cx', n.c2x);
    circle2.setAttributeNS(null, 'cy', n.c2y);
    circle2.setAttributeNS(null, 'r', 2);
    svg.appendChild(circle2);
    nodes[i].debug.cp2 = circle2;
  });
}
)}

function _update(ease){return(
function update(nodes, controlPoints, amplitude) {
  nodes.forEach((n, i) => {
    if (Math.abs(nodes[i].nextX - nodes[i].x) < 10) {
      const shiftX = (~~(Math.random() * 5) - 2) * Math.random() * amplitude / 2; 
      nodes[i].prevX = nodes[i].x;
      nodes[i].nextX = nodes[i].baseX + shiftX;
    }
    if (Math.abs(nodes[i].nextY - nodes[i].y) < 10) {
      const shiftY = (~~(Math.random() * 5) - 2) * Math.random() * amplitude / 2; 
      nodes[i].prevY = nodes[i].y;
      nodes[i].nextY = nodes[i].baseY + shiftY;
    }
    const distanceX = nodes[i].nextX - nodes[i].prevX;
    const distanceY = nodes[i].nextY - nodes[i].prevY;
    const remainingDistanceX = nodes[i].nextX - nodes[i].x;
    const remainingDistanceY = nodes[i].nextY - nodes[i].y;
    let tX = 1 - remainingDistanceX / distanceX;
    let tY = 1 - remainingDistanceY / distanceY;

    const shiftX = ease(tX > 0 ? tX : 0.2) * distanceX;
    const shiftY = ease(tY > 0 ? tY : 0.2) * distanceY;
    // const shiftX = 0;
    // const shiftY = 0;
    // console.log({tX, x: nodes[i].x, nextX: nodes[i].nextX, y: nodes[i].y, prevX: nodes[i].prevX, distanceX, remainingDistanceX});

    nodes[i].x += shiftX;
    nodes[i].y += shiftY;
    controlPoints[i].c1x += shiftX;
    controlPoints[i].c1y += shiftY;
    controlPoints[i].c2x += shiftX;
    controlPoints[i].c2y += shiftY;

    n.debug.cpLine.setAttributeNS(null, 'd', `
      M${controlPoints[i].c1x} ${controlPoints[i].c1y}
      L${controlPoints[i].c2x} ${controlPoints[i].c2y}
    `);
    n.debug.node.setAttributeNS(null, 'cx', n.x);
    n.debug.node.setAttributeNS(null, 'cy', n.y);

    n.debug.cp1.setAttributeNS(null, 'cx', controlPoints[i].c1x);
    n.debug.cp1.setAttributeNS(null, 'cy', controlPoints[i].c1y);
    n.debug.cp2.setAttributeNS(null, 'cx', controlPoints[i].c2x);
    n.debug.cp2.setAttributeNS(null, 'cy', controlPoints[i].c2y);
  });
}
)}

function _drawBlobPath(){return(
function drawBlobPath(nodes, controlPoints, path) {
  path.setAttributeNS(null, 'd', `
    M${nodes[nodes.length - 1].x} ${nodes[nodes.length - 1].y}
    ${nodes.map((n, i) => `
C ${i === 0
  ? controlPoints[controlPoints.length - 1].c2x
  : controlPoints[i - 1].c2x
} ${i === 0
  ? controlPoints[controlPoints.length - 1].c2y
  : controlPoints[i - 1].c2y
}, ${controlPoints[i].c1x} ${controlPoints[i].c1y}, ${n.x} ${n.y}
`).join('')}
    Z
  `);
}
)}

function _input(html){return(
function input(config) {
  let {
    form,
    type = "text",
    attributes = {},
    action,
    getValue,
    title,
    description,
    format,
    display,
    submit,
    options
  } = config;
  const wrapper = html`<div></div>`;
  if (!form)
    form = html`<form>
	<input name=input type=${type} style="margin-right: 1em"/>
  </form>`;
  Object.keys(attributes).forEach(key => {
    const val = attributes[key];
    if (val != null) form.input.setAttribute(key, val);
  });
  if (submit)
    form.append(
      html`<input name=submit type=submit style="margin: 0 0.75em" value="${
        typeof submit == "string" ? submit : "Submit"
      }" />`
    );
  if (title)
    form.append(
      html`<span class="btn" style="font-size: 80%; font-weight: bold">${title}</span>`
    );
  form.append(
    html`<output name=output class="btn" style="font-size: 80%"></output>`
  );
  if (description)
    form.append(
      html`<div style="font-size: 0.85rem; font-style: italic; margin-top: 3px;">${description}</div>`
    );
  if (action) {
    action(form);
  } else {
    const verb = submit
      ? "onsubmit"
      : type == "button"
      ? "onclick"
      : type == "checkbox" || type == "radio"
      ? "onchange"
      : "oninput";
    form[verb] = e => {
      e && e.preventDefault();
      const value = getValue ? getValue(form.input) : form.input.value;
      if (form.output) {
        const out = display ? display(value) : format ? format(value) : value;
        if (out instanceof window.Element) {
          while (form.output.hasChildNodes()) {
            form.output.removeChild(form.output.lastChild);
          }
          form.output.append(out);
        } else {
          form.output.value = out;
        }
      }
      form.value = value;
      if (verb !== "oninput")
        form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    };
    if (verb !== "oninput")
      wrapper.oninput = e => e && e.stopPropagation() && e.preventDefault();
    if (verb !== "onsubmit") form.onsubmit = e => e && e.preventDefault();
    form[verb]();
  }
  while (form.childNodes.length) {
    wrapper.appendChild(form.childNodes[0]);
  }
  form.append(wrapper);
  return form;
}
)}

function _slider(input){return(
function slider(config = {}) {
  let {
    min = 0,
    max = 1,
    value = (max + min) / 2,
    step = "any",
    precision = 2,
    title,
    description,
    disabled,
    getValue,
    format,
    display,
    submit
  } = typeof config === "number" ? { value: config } : config;
  precision = Math.pow(10, precision);
  if (!getValue)
    getValue = input => Math.round(input.valueAsNumber * precision) / precision;
  return input({
    type: "range",
    title,
    description,
    submit,
    format,
    display,
    attributes: { min, max, step, disabled, value },
    getValue
  });
}
)}

function _24(html){return(
html`
<form><h2>CSS</h2></form>
<pre>CSS is form,
form follows function[s],
indeed, that is a pun</pre>
<style>
canvas, svg {
  box-shadow: 1px 2px 8px rgba(0,0,0,0.06);
  border: 0.5px solid rgba(0,0,0,0.05);
}
.mono {
  font: var(--mono_fonts);
}
.btn {
  background-color: transparent;
  display: inline-block;
  border: 2px solid black;
  padding: 0.2em 0.6em 0.2em;
  font-weight: 500;
  font-family: Oswald,sans-serif;
  margin-right: 0.5em;
}

.btn.ctrl {
  font-size: 1.1em;
  margin: 0;
}

.btn.ctrl:hover, .btn.ctrl:focus {
  outline: none;
  background-color: #111;
  border-color: #111;
  color: white;
}

.btn.ctrl:active {
  outline: none;
  transform: scale(0.93);
}

.ib {
  display: inline-block;
}

.stats {
  font-family: Oswald,sans-serif;
  display: flex;
  flex-wrap: wrap;
  max-width: 42em;
  font-size: 110%;
}

.stats .btn, .stats span {
  opacity: 1;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  text-align: center;
  align-items: flex-start;
}

.stats > span:hover {
  opacity: 1;
}

.stats > span:last-of-type {
  margin-right: 0;
}

.stats .btn {
  padding: 0.05em 0.4em 0.15em;
  font-size: 1em;
  margin-right: 0.7em;
}

/*
	Style range inputs - http://danielstern.ca/range.css
*/
input[type=range] {
  -webkit-appearance: none;
  width: 90%;
  max-width: 42em;
  margin: 0 0;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-moz-focus-outer {
  border: 0;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  box-shadow: 0.7px 0.7px 0.5px rgba(0, 0, 20, 0.33), 0px 0px 0.7px rgba(0, 0, 46, 0.33);
  background: rgba(142, 142, 142, 0.24);
  border-radius: 25px;
  border: 0.2px solid #b8b8b8;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 0.25px 0.25px 2px rgba(42, 33, 42, 0.7), 0px 0px 0px rgba(56, 44, 56, 0.5);
  border: 0.2px solid #b8b8b8;
  height: 18px;
  width: 18px;
  border-radius: 15px;
  background: #fff;
  background-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.02) 58%, rgba(0,0,0,0) 62%);
  background-size: 20px 20px;
  background-position: 0.1px 1px;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6.7px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: rgba(250, 250, 250, 0.24);
}
input[type=range]:focus::-webkit-slider-thumb {
  background-color: #fdfdfd;
}

input[type=range]::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  box-shadow: 0.7px 0.7px 0.5px rgba(0, 0, 20, 0.33), 0px 0px 0.7px rgba(0, 0, 46, 0.33);
  background: rgba(142, 142, 142, 0.24);
  border-radius: 25px;
  border: 0.2px solid #b8b8b8;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 0px 0px 1.5px rgba(42, 33, 42, 0.5), 0px 0px 0px rgba(56, 44, 56, 0.25);
  border: 0.2px solid #b8b8b8;
  height: 18px;
  width: 18px;
  border-radius: 15px;
  background: #ffffff;
  background-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.02) 58%, rgba(0,0,0,0) 62%);
  background-size: 20px 20px;
  background-position: center 1px;
  cursor: pointer;
}
input[type=range]:focus::-moz-range-track {
  background: rgba(250, 250, 250, 0.24);
}
input[type=range]:focus::-moz-range-thumb {
  background-color: #fdfdfd;
}

input[type=range]::-ms-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: rgba(15, 15, 15, 0.24);
  border: 0.2px solid #b8b8b8;
  border-radius: 50px;
  box-shadow: 0.7px 0.7px 0.5px rgba(0, 0, 20, 0.33), 0px 0px 0.7px rgba(0, 0, 46, 0.33);
}
input[type=range]::-ms-fill-upper {
  background: rgba(142, 142, 142, 0.24);
  border: 0.2px solid #b8b8b8;
  border-radius: 50px;
  box-shadow: 0.7px 0.7px 0.5px rgba(0, 0, 20, 0.33), 0px 0px 0.7px rgba(0, 0, 46, 0.33);
}
input[type=range]::-ms-thumb {
  box-shadow: 0px 0px 3.5px rgba(42, 33, 42, 0.7), 0px 0px 0px rgba(56, 44, 56, 0.5);
  border: 0.4px solid #b8b8b8;
  height: 18px;
  width: 18px;
  border-radius: 15px;
  background: #ffffff;
  background-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.02) 58%, rgba(0,0,0,0) 62%);
  background-size: 20px 20px;
  background-position: center 1px;
  cursor: pointer;
  height: 5px;
}
input[type=range]:focus::-ms-fill-lower {
  background: rgba(142, 142, 142, 0.24);
}
input[type=range]:focus::-ms-fill-upper {
  background: rgba(250, 250, 250, 0.24);
}
input[type=range]:focus::-ms-fill-upper {
  background-color: #fdfdfd;
}

</style>
`
)}

function _25(md){return(
md`
## Want some more?
Learn [how to create a pendulum simulation with canvas + javascript](https://observablehq.com/@daformat/pendulum-pendulus-flexibile), complete with adjustable friction, gravity, reaction to velocity, moustachiness and much more!
`
)}

function _26(html){return(
html`
  <iframe width="100%" height="250" style="max-width: 600px;" frameborder="0"
  src="https://observablehq.com/embed/@daformat/pendulum-pendulus-flexibile?cell=canvas"></iframe>
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("blobs")).define("blobs", ["radius","totalNodes","amplitudeFactor","debug","createGradient","shadow","createDropshadowFilter","createNodes","createControlPoints","appendNodes","appendControlPoints","drawBlobPath","update"], _blobs);
  main.variable(observer("viewof speed")).define("viewof speed", ["slider"], _speed);
  main.variable(observer("speed")).define("speed", ["Generators", "viewof speed"], (G, _) => G.input(_));
  main.variable(observer("viewof amplitudeFactor")).define("viewof amplitudeFactor", ["slider"], _amplitudeFactor);
  main.variable(observer("amplitudeFactor")).define("amplitudeFactor", ["Generators", "viewof amplitudeFactor"], (G, _) => G.input(_));
  main.variable(observer("viewof radius")).define("viewof radius", ["slider"], _radius);
  main.variable(observer("radius")).define("radius", ["Generators", "viewof radius"], (G, _) => G.input(_));
  main.variable(observer("viewof totalNodes")).define("viewof totalNodes", ["slider"], _totalNodes);
  main.variable(observer("totalNodes")).define("totalNodes", ["Generators", "viewof totalNodes"], (G, _) => G.input(_));
  main.variable(observer("viewof shadow")).define("viewof shadow", ["checkbox"], _shadow);
  main.variable(observer("shadow")).define("shadow", ["Generators", "viewof shadow"], (G, _) => G.input(_));
  main.variable(observer("viewof debug")).define("viewof debug", ["checkbox"], _debug);
  main.variable(observer("debug")).define("debug", ["Generators", "viewof debug"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _10);
  main.variable(observer("createDropshadowFilter")).define("createDropshadowFilter", _createDropshadowFilter);
  main.variable(observer("createGradient")).define("createGradient", _createGradient);
  main.variable(observer("ease")).define("ease", ["speed"], _ease);
  main.variable(observer("rotate")).define("rotate", _rotate);
  main.variable(observer("createNodes")).define("createNodes", ["totalNodes"], _createNodes);
  main.variable(observer("appendNodes")).define("appendNodes", _appendNodes);
  main.variable(observer("createControlPoints")).define("createControlPoints", ["totalNodes","rotate"], _createControlPoints);
  main.variable(observer("appendControlPoints")).define("appendControlPoints", _appendControlPoints);
  main.variable(observer("update")).define("update", ["ease"], _update);
  main.variable(observer("drawBlobPath")).define("drawBlobPath", _drawBlobPath);
  main.variable(observer("input")).define("input", ["html"], _input);
  main.variable(observer("slider")).define("slider", ["input"], _slider);
  const child1 = runtime.module(define1);
  main.import("checkbox", child1);
  main.variable(observer()).define(["html"], _24);
  main.variable(observer()).define(["md"], _25);
  main.variable(observer()).define(["html"], _26);
  return main;
}
