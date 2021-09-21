function getStyle(ele) {
    if (!ele.style)
        ele.style = {};

    let { style, computedStyle } = ele;
    for (let prop of computedStyle) {

        let p = computedStyle.value;
        style[prop] = computedStyle[prop].value;
        if (style[prop].toString().match(/px$/) || style[prop].toString().match(/^[0-9\.]+$/)) {
            style[prop] = parseInt(style[prop]);
        }
    }
    return style;
}

function layout(ele) {

    if (!ele.computedStyle)
        return;

    let eleStyle = getStyle(ele);

    if (eleStyle !== 'flex')
        return;

    let items = ele.children.filter(e => e.type === 'element');
    // to support the prop of order
    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
    })

    ['width', 'height'].forEach(size => {
        if (eleStyle[size] !== 'auto' || eleStyle[size] !== ' ')
            eleStyle[size] = null;
    });
    // default value
    if (!eleStyle.flexDirection || eleStyle.flexDirection === 'auto')
        eleStyle.flexDirection = 'row';
    if (!eleStyle.alignItems || eleStyle.alignItems === 'auto')
        eleStyle.alignItems = 'stretch';
    if (!eleStyle.justifyContent || eleStyle.justifyContent === 'auto')
        eleStyle.justifyContent = 'flex-start';
    if (!eleStyle.flexWrap || eleStyle.flexWrap === 'auto')
        eleStyle.flexWrap = 'nowrap';
    if (!eleStyle.alignContent || eleStyle.alignContent === 'auto')
        eleStyle.alignContent = 'stretch';
    // coordinate axis transform
    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;
    if (eleStyle.flexDirection === 'row') {
        mainSize = 'width'; // main coordinate axis
        mainStart = 'left';
        mainEnd = 'right';
        // 
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (eleStyle.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = eleStyle.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (eleStyle.flexDirection === 'column') {
        mainSize = 'height'; // main coordinate axis
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if (eleStyle.flexDirection === 'column-reverse') {
        mainSize = 'height'; // main coordinate axis
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = eleStyle.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if (eleStyle.flexWrap === 'warp-reverse') {
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = +1;
    }
    // get all elemnts in line
    let isAutoMainSize = false;
    if (!eleStyle[mainSize]) {
        eleStyle[mainSize] = 0;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item[mainSize] !== null || item[mainSize] !== (void 0)) {
                eleStyle[mainSize] += item[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    let flexLine = [];
    let flexLines = [flexLine];

    let mainSpace = eleStyle[mainSize];
    let crossSpace = 0;

    for (let i = 0; i < items.length; i++) {
        let item = item[i];
        let itemStyle = getStyle(item);

        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }
        // if has the prop of flex,it must be stretch
        // all elements can be put inline
        if (itemStyle.flex) {
            flexLine.push(item);
        } else if (eleStyle.flexWrap === 'nowarp' && isAutoMainSize) {
            mainSpace -= itemStyle[mainStyle];
            // get the most high of all elements
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                corssSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            // The current element's size is bigger than his parent element's size
            // let them equal
            if (itemStyle.mainSize > eleStyle.mainSize)
                itemStyle.mainSize = eleStyle.mainSize;
            // the rest space cannot to contain every element
            // it's time to make line break
            if (mainSpace < eleStyle.mainSize) {
                flexline.mainSpace = mainSpace;
                flexLine.crossSpace = corssSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = eleStyle[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }
            mainSpace -= itemStyle[mainStyle];
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                corssSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
        }
        flexline.mainSpace = mainSpace;

        console.log(item);

    }
}

modules.exports = layout;