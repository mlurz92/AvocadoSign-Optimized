const publicationTabComponents = (publicationTabComponents => {

    function renderConsortDiagram(containerId, lang, nGesamt, nDirektOP, nNRCT) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`CONSORT Diagramm Container '${containerId}' nicht gefunden.`);
            return;
        }
        container.innerHTML = '';

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");

        const totalPatients = nGesamt || 0;
        const upfrontSurgeryPatients = nDirektOP || 0;
        const nRCTPatients = nNRCT || 0;

        const diagramWidth = 600;
        const diagramHeight = 450;
        const boxWidth = 220;
        const boxHeight = 70;
        const arrowLength = 40;
        const verticalSpacing = boxHeight + arrowLength;
        const horizontalBranchSpacing = 180;

        const fontFamily = getComputedStyle(document.body).fontFamily || 'Arial, sans-serif';
        const fontSize = 13;
        const textFill = getComputedStyle(document.body).getPropertyValue('--bs-body-color') || '#212529';
        const boxStroke = textFill;
        const boxFill = getComputedStyle(document.body).getPropertyValue('--bs-body-bg') || '#ffffff';
        const lineStroke = textFill;

        svg.setAttribute("width", diagramWidth);
        svg.setAttribute("height", diagramHeight);
        svg.setAttribute("viewBox", `0 0 ${diagramWidth} ${diagramHeight}`);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-labelledby", `${containerId}-title`);

        const titleElement = document.createElementNS(svgNS, "title");
        titleElement.id = `${containerId}-title`;
        titleElement.textContent = lang === 'de' ? 'CONSORT Flussdiagramm der Patientenauswahl' : 'CONSORT Flow Diagram of Patient Selection';
        svg.appendChild(titleElement);

        function createBox(x, y, width, height, textLines) {
            const group = document.createElementNS(svgNS, "g");
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);
            rect.setAttribute("fill", boxFill);
            rect.setAttribute("stroke", boxStroke);
            rect.setAttribute("stroke-width", "1.5");
            rect.setAttribute("rx", "3");
            rect.setAttribute("ry", "3");
            group.appendChild(rect);

            const lineHeight = fontSize * 1.3;
            const totalTextHeight = textLines.length * lineHeight;
            const startY = y + (height - totalTextHeight) / 2 + fontSize * 0.8;

            textLines.forEach((line, index) => {
                const textElement = document.createElementNS(svgNS, "text");
                textElement.setAttribute("x", x + width / 2);
                textElement.setAttribute("y", startY + index * lineHeight);
                textElement.setAttribute("text-anchor", "middle");
                textElement.setAttribute("font-family", fontFamily);
                textElement.setAttribute("font-size", fontSize);
                textElement.setAttribute("fill", textFill);
                textElement.textContent = line;
                group.appendChild(textElement);
            });
            return group;
        }

        function createArrow(x1, y1, x2, y2, hasMarker = true) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2 - (hasMarker ? 5 : 0));
            line.setAttribute("stroke", lineStroke);
            line.setAttribute("stroke-width", "1.5");
            if (hasMarker) {
                line.setAttribute("marker-end", "url(#arrowhead)");
            }
            return line;
        }

        const defs = document.createElementNS(svgNS, "defs");
        const marker = document.createElementNS(svgNS, "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "0");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        const polygon = document.createElementNS(svgNS, "polygon");
        polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
        polygon.setAttribute("fill", lineStroke);
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        const centerX = diagramWidth / 2;

        const box1X = centerX - boxWidth / 2;
        const box1Y = 20;
        const box1Text = lang === 'de' ?
            [`Patienten mit Rektumkarzinom für`, `Avocado-Sign Analyse evaluiert`, `(N = ${totalPatients})`] :
            [`Patients with Rectal Cancer Assessed`, `for Avocado Sign Analysis`, `(n = ${totalPatients})`];
        svg.appendChild(createBox(box1X, box1Y, boxWidth, boxHeight, box1Text));

        svg.appendChild(createArrow(centerX, box1Y + boxHeight, centerX, box1Y + verticalSpacing));

        const box2X = centerX - boxWidth / 2;
        const box2Y = box1Y + verticalSpacing;
        const box2Text = lang === 'de' ?
            [`Aufgeteilt in Behandlungsgruppen`, `(gemäß Primärstudie)`] :
            [`Allocated to Treatment Groups`, `(per primary study protocol)`];
        svg.appendChild(createBox(box2X, box2Y, boxWidth, boxHeight, box2Text));

        const branchYStart = box2Y + boxHeight;
        const branchYEnd = branchYStart + arrowLength * 0.8;

        const branchLX1 = centerX - boxWidth / 2 + 5;
        const branchLX2 = centerX - horizontalBranchSpacing / 2;
        const branchRX1 = centerX + boxWidth / 2 - 5;
        const branchRX2 = centerX + horizontalBranchSpacing / 2;

        svg.appendChild(createArrow(centerX, branchYStart, branchLX2, branchYEnd, false));
        svg.appendChild(createArrow(centerX, branchYStart, branchRX2, branchYEnd, false));

        const lineHorizontal = document.createElementNS(svgNS, "line");
        lineHorizontal.setAttribute("x1", branchLX2);
        lineHorizontal.setAttribute("y1", branchYEnd);
        lineHorizontal.setAttribute("x2", branchRX2);
        lineHorizontal.setAttribute("y2", branchYEnd);
        lineHorizontal.setAttribute("stroke", lineStroke);
        lineHorizontal.setAttribute("stroke-width", "1.5");
        svg.appendChild(lineHorizontal);

        const box3AY = branchYEnd + arrowLength * 0.2;
        const box3AX = centerX - horizontalBranchSpacing / 2 - boxWidth / 2;
        const box3AText = lang === 'de' ?
            [`Primär operative Therapie`, `(Direkt-OP Gruppe)`, `(N = ${upfrontSurgeryPatients})`] :
            [`Upfront Surgical Resection`, `(Upfront Surgery Group)`, `(n = ${upfrontSurgeryPatients})`];
        svg.appendChild(createArrow(branchLX2, branchYEnd, branchLX2, box3AY));
        svg.appendChild(createBox(box3AX, box3AY, boxWidth, boxHeight, box3AText));

        const box3BY = branchYEnd + arrowLength * 0.2;
        const box3BX = centerX + horizontalBranchSpacing / 2 - boxWidth / 2;
        const box3BText = lang === 'de' ?
            [`Neoadjuvante Radiochemotherapie`, `(nRCT Gruppe)`, `(N = ${nRCTPatients})`] :
            [`Neoadjuvant Chemoradiotherapy`, `(nRCT Group)`, `(n = ${nRCTPatients})`];
        svg.appendChild(createArrow(branchRX2, branchYEnd, branchRX2, box3BY));
        svg.appendChild(createBox(box3BX, box3BY, boxWidth, boxHeight, box3BText));

        const analysisYStart = box3AY + boxHeight;
        const analysisYEnd = analysisYStart + arrowLength;

        svg.appendChild(createArrow(box3AX + boxWidth / 2, analysisYStart, box3AX + boxWidth / 2, analysisYEnd));
        const box4AY = analysisYEnd;
        const box4AText = lang === 'de' ?
            [`In Analyse eingeschlossen`, `(N = ${upfrontSurgeryPatients})`] :
            [`Included in Analysis`, `(n = ${upfrontSurgeryPatients})`];
        svg.appendChild(createBox(box3AX, box4AY, boxWidth, boxHeight, box4AText));

        svg.appendChild(createArrow(box3BX + boxWidth / 2, analysisYStart, box3BX + boxWidth / 2, analysisYEnd));
        const box4BY = analysisYEnd;
        const box4BText = lang === 'de' ?
            [`In Analyse eingeschlossen`, `(N = ${nRCTPatients})`] :
            [`Included in Analysis`, `(n = ${nRCTPatients})`];
        svg.appendChild(createBox(box3BX, box4BY, boxWidth, boxHeight, box4BText));

        container.appendChild(svg);
    }

    publicationTabComponents = {
        ...(publicationTabComponents || {}),
        renderConsortDiagram
    };
    return publicationTabComponents;

})(window.publicationTabComponents || {});
