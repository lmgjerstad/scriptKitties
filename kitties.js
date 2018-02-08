var assistant = {};

/**
 * TODO
 */
assistant.autoCheck = {
  build: false,
  craft: false,
  hunt: false,
  trade: false,
  praise: false,
  science: false,
  upgrade: false,
  party: false,
  assign: false,
  energy: false
};

/**
 * TODO
 */
assistant.craftCaps = {
  blueprint: 500,
  alloy: 4000,
};

assistant.buildings =
    gamePage.bld.buildingsData.reduce((a, b) => (a[b.name] = 0, a), {});

assistant.spaceBuildings = {};

assistant.craftPrices = gamePage.workshop.crafts.reduce(
    (a, c) =>
        (a[c.name] = c.prices.reduce((a, p) => (a[p.name] = p.val, a), {}), a),
    {});

assistant.craftOrder = (() => {
  let prices = Object.assign({}, assistant.craftPrices);
  delete prices['wood']; // Never use catnip to build buildings.
  let unsorted = Object.keys(prices);
  let target = unsorted.length;
  let sorted = unsorted.filter(
      n => Object.keys(prices[n]).reduce(
          (a, p) => a ? prices[p] === undefined : a, true));
  let seen = sorted.reduce((a,n) => (a[n] = true, a), {});

  while (sorted.length !== target) {
    unsorted = unsorted.filter(n => !seen[n]);
    let grp = unsorted.filter(
        n => Object.keys(prices[n]).reduce(
            (a, p) => a ? seen[p] || prices[p] === undefined : a, true));
    grp.forEach(n => seen[n] = true);
    sorted = sorted.concat(grp);
  }
  return sorted.reverse();
})();

assistant.primaryCrafts = {
  catnip : "wood",
  wood : "beam",
  minerals : "slab",
  iron : "plate",
  coal : "steel",
  titanium : "alloy",
  oil : "kerosene",
  uranium : "thorium",
  unobtainium : "eludium",
  culture : "manuscript",
  science : "compedium"
};

assistant.crafts = {
  primary : {},
  extra : {},
};

/**
 * TODO
 * @param {Array} prices - Each entry is an object containing name and val.
 * @returns {Array} Index 0 indicates whether the price can be afforded, index 1 indicates the required craftings.
 */
assistant.canAfford = function(prices) {
  let costs = prices.reduce((a,p) => (a[p.name] = p.val,a), {});
  let crafts = [];
  // Craftable materials we don't have can be pulled from a lower level.
  assistant.craftOrder.forEach(n => {
    if (costs[n] !== undefined) {
      let have = gamePage.resPool.get(n).value;
      if (have >= costs[n]) {
        delete costs[n];
      } else {
        let need = costs[n] - have;
        let ratio = 1 + gamePage.getResCraftRatio(n);
        let count = Math.ceil(need / ratio);
        Object.entries(assistant.craftPrices[n]).forEach(p => {
          let name = p[0];
          let val = p[1] * count;
          if (costs[name] === undefined) {
            costs[name] = val;
          } else {
            costs[name] += val;
          }
        })
        crafts.push([n, count]);
        delete costs[n];
      }
    }
  });

  // Everything left in costs is a non-craftable item.
  let insufficient = Object.entries(costs)
                         .filter(c => gamePage.resPool.get(c[0]).value < c[1])
                         .length > 0;

  if (insufficient) {
    return [false, []];
  } else {
    return [true, crafts];
  }
};

assistant.pushButton = function (button, tabName) {
  if (gamePage.ui.activeTabId != tabName) {
    gamePage.ui.activeTabId = tabName;
    gamePage.render();
  }
  try {
    button.controller.updateEnabled(button.model);
    button.controller.buyItem(button.model, {}, r => {
      if (r) {
        button.update();
        console.log('Purchased ' + button.model.metadata.label);
      }
    });
  } catch(err) {
    console.log(err);
  }
}

/**
 * TODO
 */
assistant.renderBuildingSelect = function() {
  var bldSelectAddition =
      '<div id="buildingSelect" style="display:none; margin-top:-400px; width:600px;" class="dialog help">' +
      '<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#buildingSelect\').hide();" style="float: left;">space</a>' +
      '<a href="#" onclick="$(\'#craftSelect\').toggle(); $(\'#buildingSelect\').hide();" style="float: left; margin-left: 20 px;">craft</a>' +
      '<a href="#" onclick="$(\'#buildingSelect\').hide();" style="float: right;">close</a><br>' +
      '<table width=100%>'

  let count = 0;
  var getName = b =>
      b.label === undefined ? b.stages.map(x => x.label).join('/') : b.label;
  var bldSelect = b => {
      ++count;
      return ((count % 2 === 1) ? '<tr>' : '') + '<td><input type="text" id="auto_' + b.name +
      '" style="width:25px;"></td><td><label for="auto_' + b.name + '">' + getName(b) +
      '</label>' + ((count % 2 === 1) ? '' : '</tr>');
  };
  var buildings = gamePage.bld.buildingsData.reduce(
      (a, b) => (a[b.name] = b, a), {});

  bldSelectAddition += gamePage.bld.buildingGroups.map(
      g => {
        count = 0;
        return '<tr><td colspan=4><label><b>' + g.title + '</b></label></td></tr>' +
          g.buildings.map(b => bldSelect(buildings[b])).join('') + ((count % 2 == 1) ? '</tr>' : '')}).join('');

  bldSelectAddition += '</table></div>';

  $('#game').append(bldSelectAddition);

  Object.keys(buildings).forEach(n => {
        let o = document.getElementById('auto_' + n);
        if (assistant.buildings[n] === undefined) {
          assistant.buildings[n] = 0;
        }
        o.value = assistant.buildings[n];
        o.onchange = () => assistant.buildings[n] = o.value;
  });
};
/**
 * TODO
 */
assistant.autoBuild = function() {
  if (this.autoCheck['build']) {
    var origTab = gamePage.ui.activeTabId;
    gamePage.tabs[0].buttons.forEach(b => {
      if (b.model.metadata === undefined) {
        return;
      }
      let name = b.model.metadata.name;
      let building = gamePage.bld.getBuildingExt(name);
      if (building.meta.unlocked && building.meta.val < this.buildings[name]) {
        let [can,crafts] = this.canAfford(gamePage.bld.getPrices(name));
        if (can) {
          crafts.forEach(c => gamePage.craft(c[0], c[1]));
          assistant.pushButton(b, 'Bonfire');
        }
      }
    });

    if (origTab != gamePage.ui.activeTabId) {
      gamePage.ui.activeTabId = origTab;
      gamePage.render();
    }
  }
};

assistant.renderSpaceSelect = function() {
  var bldSelectAddition =
      '<div id="spaceSelect" style="display:none; margin-top:-400px; width:600px;" class="dialog help">' +
      '<a href="#" onclick="$(\'#buildingSelect\').toggle(); $(\'#spaceSelect\').hide();" style="float: left;">building</a>' +
      '<a href="#" onclick="$(\'#craftSelect\').toggle(); $(\'#spaceSelect\').hide();" style="float: left; margin-left: 20px;">space</a>' +
      '<a href="#" onclick="$(\'#spaceSelect\').hide();" style="float: right;">close</a><br>' +
      '<table width=100%>'

  let count = 0;
  var bldSelect = b => {
      ++count;
      return ((count % 2 === 1) ? '<tr>' : '') + '<td><input type="text" id="auto_' + b.name +
      '" style="width:25px;"></td><td><label for="auto_' + b.name + '">' + b.label +
      '</label>' + ((count % 2 === 1) ? '' : '</tr>');
  };

  bldSelectAddition += gamePage.space.planets.map(
      p => {
        count = 0;
        return '<tr><td colspan=4><label><b>' + p.label + '</b></label></td></tr>' +
          p.buildings.map(b => bldSelect(b)).join('')}).join('');

  bldSelectAddition += '</table></div>';

  $('#game').append(bldSelectAddition);

  gamePage.space.spaceBuildingsMap.forEach(n => {
        let o = document.getElementById('auto_' + n);
        if (assistant.spaceBuildings[n] === undefined) {
          assistant.spaceBuildings[n] = 0;
        }
        o.value = assistant.spaceBuildings[n];
        o.onchange = () => assistant.spaceBuildings[n] = o.value;
  });
};

assistant.autoSpace = function () {
  if (autoCheck['build'] && gamePage.tabs[6].visible) {
    var origTab = gamePage.ui.activeTabId;
  
    gamePage.tabs[6].planetPanels.forEach(p => {
      p.children.forEach(c => {
        let name = c.model.metadata.name;
        let bld = gamePage.space.getBuilding(name);
        if (bld.val < assistant.spaceBuildings[name]) {
          let [can,req] = assistant.canAfford(c.controller.getPrices(c.model));
          if (can) {
            req.forEach(x => gamePage.craft(x[0], x[1]));
            assistant.pushButton(c, 'space');
          }
        }
      });
    });
  
      // Build space programs
    if (programBuild != false) {
      gamePage.tabs[6].GCPanel.children.forEach(b => {
        if (b.model.metadata.unlocked && b.model.on == 0) {
          let [can,req] = assistant.canAfford(b.controller.getPrices(b.model));
          if (can) {
            req.forEach(x => gamePage.craft(x[0], x[1]));
            assistant.pushButton(b, 'Space');
          }
        }
      });
    }
  
    if (origTab != gamePage.ui.activeTabId) {
      gamePage.ui.activeTabId = origTab;
      gamePage.render();
    }
  }
}

assistant.renderCraftSelect = function() {
  var craftSelectAddition =
      '<div id="craftSelect" style="display:none; margin-top:-400px; width:600px;" class="dialog help">' +
      '<a href="#" onclick="$(\'#buildingSelect\').toggle(); $(\'#craftSelect\').hide();" style="float: left;">space</a>' +
      '<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#craftSelect\').hide();" style="float: left; margin-left: 20px;">craft</a>' +
      '<a href="#" onclick="$(\'#craftSelect\').hide();" style="float: right;">close</a><br>' +
      '<label><b>Primary Resources</b></label><br>';

  craftSelectAddition += gamePage.resPool.resources.filter(r => assistant.primaryCrafts[r.name] !== undefined).map(r =>
    '<input type="checkbox" id="autocraft_' + r.name +
    '"><label for="autocraft_' + r.name + '">' + r.title + ' => ' +
    gamePage.resPool.get(assistant.primaryCrafts[r.name]).title + '</label><br>').join('');

  let reversePrimary = Object.entries(assistant.primaryCrafts).reduce((a,b) => (a[b[1]] = b[0], a), {});
  let secondaryCrafts = gamePage.workshop.crafts.filter(c => reversePrimary[c.name] === undefined);
  craftSelectAddition += '<br><label><b>Additional Resources</b></label><br>';
  craftSelectAddition += secondaryCrafts.map(c =>
    '<input type="text" id="autocraft_' + c.name + '" style="width:25px;"><label for="autocraft_' + c.name +
    '">' + c.label + '</label><br>').join('');


  $('#game').append(craftSelectAddition);

  Object.keys(assistant.primaryCrafts).forEach(r => {
        let o = document.getElementById('autocraft_' + r);
        if (assistant.crafts.primary[r] === undefined) {
          assistant.crafts.primary[r] = true;
        }
        o.checked = assistant.crafts.primary[r];
        o.onchange = () => assistant.crafts.primary[r] = o.checked;
  });

  secondaryCrafts.forEach(c => {
    let name = c.name;
    let o = document.getElementById('autocraft_' + name);
    if (assistant.crafts.extra[name] === undefined) {
      assistant.crafts.extra[name] = 0;
    }
    o.value = assistant.crafts.extra[name];
    o.onchange = () => assistant.crafts.extra[name] = o.value;
  });
};

/**
 * TODO
 */
assistant.autoResearch = function() {
  if (this.autoCheck['science'] && gamePage.libraryTab.visible != false) {
    var origTab = gamePage.ui.activeTabId;

    var btn = gamePage.tabs[2].buttons;

    for (var i = 0; i < btn.length; i++) {
      if (btn[i].model.metadata.unlocked &&
          btn[i].model.metadata.researched != true) {
        var can = this.canAfford(btn[i].model.metadata.prices);
        if (can[0]) {
          for (var i in can[1]) {
            gamePage.craft(can[1][i][0], can[1][i][1]);
          }
          assistant.pushButton(btn[i], 'Science');
        }
      }
    }

    if (origTab != gamePage.ui.activeTabId) {
      gamePage.ui.activeTabId = origTab;
      gamePage.render();
    }
  }
};
/**
 * TODO
 */
assistant.autoWorkshop = function() {
  if (this.autoCheck['upgrade'] && gamePage.workshopTab.visible != false) {
    var origTab = gamePage.ui.activeTabId;

    var btn = gamePage.tabs[3].buttons;

    for (var i = 0; i < btn.length; i++) {
      if (btn[i].model.metadata.unlocked &&
          btn[i].model.metadata.researched != true) {
        var can = this.canAfford(btn[i].model.metadata.prices);
        if (can[0]) {
          for (var i in can[1]) {
            gamePage.craft(can[1][i][0], can[1][i][1]);
          }
          assistant.pushButton(btn[i], 'Workshop');
        }
      }
    }

    if (origTab != gamePage.ui.activeTabId) {
      gamePage.ui.activeTabId = origTab;
      gamePage.render();
    }
  }
};
/**
 * TODO
 */
assistant.autoObserve = function() {
  var checkObserveBtn = document.getElementById('observeBtn');
  if (typeof (checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
    checkObserveBtn.click();
  }
};
/**
 * TODO
 */
assistant.autoPraise = function() {
  if (this.autoCheck['praise'] &&
      gamePage.bld.getBuildingExt('temple').meta.val > 0) {
    var faith = gamePage.resPool.get('faith');
    if (faith.value > faith.maxValue * 0.99) {
      gamePage.religion.praise();
    }
  }
};
/**
 * TODO
 */
assistant.autoPromote = function() {
  var count = 0;
  var k = gamePage.village.leader;
  if (k) {
    count += gamePage.village.sim.promote(k);
  }
  gamePage.village.sim.kittens.filter(k => (k.job == 'engineer' && k.rank < 5))
      .forEach(k => count += gamePage.village.sim.promote(k));
  if (count > 0) {
    console.log('Promoted ' + count + ' kittens');
  }
};
/**
 * TODO
 */
// TODO(lmgjerstad): Refactor
assistant.autoTrade = function() {
  if (this.autoCheck['trade']) {
    var titRes = gamePage.resPool.get('titanium');
    var unoRes = gamePage.resPool.get('unobtainium');
    var goldResource = gamePage.resPool.get('gold');
    if (goldResource.value / goldResource.maxValue > 0.99) {
      if (unoRes.value > 5000 &&
          gamePage.diplomacy.get('leviathans').unlocked &&
          gamePage.diplomacy.get('leviathans').duration != 0) {
        gamePage.diplomacy.tradeAll(gamePage.diplomacy.get('leviathans'));
      } else if (
          titRes.value < (titRes.maxValue * 0.9) &&
          gamePage.diplomacy.get('zebras').unlocked) {
        gamePage.diplomacy.tradeAll(gamePage.diplomacy.get('zebras'));
        //      } else if (gamePage.diplomacy.get('dragons').unlocked) {
        //        gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"));
      }
    }
  }
};
/**
 * TODO
 */
assistant.autoHunt = function() {
  if (this.autoCheck['hunt']) {
    var catpower = gamePage.resPool.get('manpower');
    if (catpower.value > catpower.maxValue * 0.99) {
      gamePage.village.huntAll();
    }
  }
};
/**
 * TODO
 */
assistant.autoCraft = function() {
  if (this.autoCheck['craft']) {
    Object.entries(assistant.primaryCrafts).filter(c => assistant.crafts.primary[c[0]]).forEach(c => {
      let [name, target] = c;
      let r = gamePage.resPool.get(name);
      // Spend enough to cover at lest 10 ticks.
      let spend = r.perTickCached * 10;
      if (r.value >= (r.maxValue - spend)) {
        let prices = assistant.craftPrices[target];
        let buy = Math.ceil(spend / prices[name]);
        let [can, reqs] = assistant.canAfford(
            Object.entries(prices).map(p => ({name: p[0], val: p[1] * buy})));
        if (can) {
          reqs.forEach(r => gamePage.craft(r[0], r[1]));
          gamePage.craft(target, buy);
        }
      }
    });

    Object.entries(assistant.crafts.extra).forEach(c => {
      let [name, want] = c;
      let r = gamePage.resPool.get(name);
      if (want > r.value) {
        let craft = gamePage.workshop.getCraft(name);
        if (!craft.unlocked) {
          return;
        }
        let [can, req] = assistant.canAfford(craft.prices);
        if (can) {
          req.forEach(c => gamePage.craft(c[0], c[1]));
        }
        gamePage.craft(name, 1);
      }
    });
  }
};

// These control the button statuses
var autoCheck = assistant.autoCheck;

// These will allow quick selection of the buildings which consume energy
var bldSmelter = gamePage.bld.buildingsData[15];
var bldBioLab = gamePage.bld.buildingsData[9];
var bldOilWell = gamePage.bld.buildingsData[20];
var bldFactory = gamePage.bld.buildingsData[22];
var bldCalciner = gamePage.bld.buildingsData[16];
var bldAccelerator = gamePage.bld.buildingsData[24];

// These are the assorted variables
var proVar = gamePage.resPool.energyProd;
var conVar = gamePage.resPool.energyCons;
var deadScript = 'Script is dead';
var furDerVal = 3;
var autoChoice = 'farmer';
var resList = [];
var secResRatio = 0;
var steamOn = 0;
var programBuild = false;

var htmlMenuAddition = '<div id="farRightColumn" class="column">' +

    '<a id="scriptOptions" onclick="selectOptions()"> | ScriptKitties </a>' +

    '<div id="optionSelect" style="display:none; margin-top:-400px; margin-left:-100px; width:200px" class="dialog help">' +
    '<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

    '<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(deadScript);">Kill Switch</button> </br>' +
    '<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button></br></br>' +
    '<button id="autoBuild" style="color:red" onclick="autoSwitch(\'build\', this);"> Auto Build </button></br>' +
    '<button id="bldSelect" onclick="selectBuildings()">Select Building</button></br>' +

    '<button id="autoAssign" style="color:red" onclick="autoSwitch(\'assign\', this)"> Auto Assign </button>' +
    '<select id="autoAssignChoice" size="1" onclick="setAutoAssignValue()">' +
    '<option value="farmer" selected="selected">Farmer</option>' +
    '<option value="woodcutter">Woodcutter</option>' +
    '<option value="scholar">Scholar</option>' +
    '<option value="priest">Priest</option>' +
    '<option value="miner">Miner</option>' +
    '<option value="hunter">Hunter</option>' +
    '<option value="engineer">Engineer</option>' +
    '</select></br>' +

    '<button id="autoCraft" style="color:red" onclick="autoSwitch(\'craft\', this)"> Auto Craft </button>' +
    '</br></br>' +


    '<button id="autoHunt" style="color:red" onclick="autoSwitch(\'hunt\', this)"> Auto Hunt </button></br>' +
    '<button id="autoTrade" style="color:red" onclick="autoSwitch(\'trade\', this)"> Auto Trade </button></br>' +
    '<button id="autoPraise" style="color:red" onclick="autoSwitch(\'praise\', this)"> Auto Praise </button></br></br>' +
    '<button id="autoScience" style="color:red" onclick="autoSwitch(\'science\', this)"> Auto Science </button></br>' +
    '<button id="autoUpgrade" style="color:red" onclick="autoSwitch(\'upgrade\', this)"> Auto Upgrade </button></br>' +
    '<button id="autoEnergy" style="color:red" onclick="autoSwitch(\'energy\', this)"> Energy Control </button></br>' +
    '<button id="autoParty" style="color:red" onclick="autoSwitch(\'party\', this)"> Auto Party </button></br></br>' +
    '</div>' +
    '</div>';


/**
 * TODO
 */
function clearOptionHelpDiv() {
  $('#optionSelect').hide();
}

/**
 * TODO
 */
function selectOptions() {
  $('#optionSelect').toggle();
}

/**
 * TODO
 */
function clearHelpDiv() {
  $('#buildingSelect').hide();
}

/**
 * TODO
 */
function selectBuildings() {
  $('#buildingSelect').toggle();
}

/**
 * TODO
 */
function setFurValue() {
  furDerVal = $('#craftFur').val();
}

/**
 * TODO
 */
function setAutoAssignValue() {
  autoChoice = $('#autoAssignChoice').val();
}

/**
 * TODO
 * @param {string} name - The name of the feature
 * @param {Object} btn - The DOM node for the button.
 */
function autoSwitch(name, btn) {
  autoCheck[name] = !autoCheck[name];
  gamePage.msg(btn.textContent + ' is now ' + (autoCheck[name] ? 'on' : 'off'));
  btn.style.color = autoCheck[name] ? 'black' : 'red';
}

/**
 * TODO
 */
function clearScript() {
  $('#farRightColumn').remove();
  $('#buildingSelect').remove();
  $('#spaceSelect').remove();
  $('#scriptOptions').remove();
  clearInterval(runAllAutomation);
}

// Show current kitten efficiency in the in-game log
/**
 * TODO
 */
function kittenEfficiency() {
  var timePlayed = gamePage.stats.statsCurrent[3].calculate(gamePage);
  var numberKittens = gamePage.resPool.get('kittens').value;
  var curEfficiency = (numberKittens - 70) / timePlayed;
  gamePage.msg(
      'Your current efficiency is ' + parseFloat(curEfficiency).toFixed(2) +
      ' kittens per hour.');
}


/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */


// Auto Observe Astronomical Events
/**
 * TODO
 */
function autoObserve() {
  assistant.autoObserve();
}

// Auto praise the sun
/**
 * TODO
 */
function autoPraise() {
  assistant.autoPraise();
}

// Build buildings automatically
/**
 * TODO
 */
function autoBuild() {
  assistant.autoBuild();
}

// Build space stuff automatically
/**
 * TODO
 */
function autoSpace() {
  assistant.autoSpace();
}

/**
 * TODO
 */
function autoPromote() {
  assistant.autoPromote();
}

// Trade automatically
/**
 * TODO
 */
function autoTrade() {
  assistant.autoTrade();
}

// Hunt automatically
/**
 * TODO
 */
function autoHunt() {
  assistant.autoHunt();
}


// Craft primary resources automatically
/**
 * TODO
 */
function autoCraft() {
  assistant.autoCraft();
}


// Auto Research
/**
 * TODO
 */
function autoResearch() {
  assistant.autoResearch();
}

// Auto Workshop upgrade , tab 3
/**
 * TODO
 */
function autoWorkshop() {
  assistant.autoWorkshop();
}

// Festival automatically
/**
 * TODO
 */
function autoParty() {
  if (autoCheck['party'] && gamePage.science.get('drama').researched) {
    var catpower = gamePage.resPool.get('manpower').value;
    var culture = gamePage.resPool.get('culture').value;
    var parchment = gamePage.resPool.get('parchment').value;

    if (catpower > 1500 && culture > 5000 && parchment > 2500) {
      if (gamePage.prestige.getPerk('carnivals').researched)
        gamePage.village.holdFestival(1);
      else if (gamePage.calendar.festivalDays = 0) {
        gamePage.village.holdFestival(1);
      }
    }
  }
}

// Auto assign new kittens to selected job
/**
 * TODO
 */
function autoAssign() {
  if (autoCheck['assign'] && gamePage.village.getJob(autoChoice).unlocked &&
      gamePage.village.getFreeKittens() > 0) {
    gamePage.village.assignJob(gamePage.village.getJob(autoChoice));
  }
}

// Control Energy Consumption
/**
 * TODO
 */
function energyControl() {
  if (autoCheck['energy']) {
    proVar = gamePage.resPool.energyProd;
    conVar = gamePage.resPool.energyCons;

    if (bldAccelerator.val > bldAccelerator.on && proVar > (conVar + 3)) {
      bldAccelerator.on++;
      conVar++;
    } else if (bldCalciner.val > bldCalciner.on && proVar > (conVar + 3)) {
      bldCalciner.on++;
      conVar++;
    } else if (bldFactory.val > bldFactory.on && proVar > (conVar + 3)) {
      bldFactory.on++;
      conVar++;
    } else if (bldOilWell.val > bldOilWell.on && proVar > (conVar + 3)) {
      bldOilWell.on++;
      conVar++;
    } else if (bldBioLab.val > bldBioLab.on && proVar > (conVar + 3)) {
      bldBioLab.on++;
      conVar++;
    } else if (bldBioLab.on > 0 && proVar < conVar) {
      bldBioLab.on--;
      conVar--;
    } else if (bldOilWell.on > 0 && proVar < conVar) {
      bldOilWell.on--;
      conVar--;
    } else if (bldFactory.on > 0 && proVar < conVar) {
      bldFactory.on--;
      conVar--;
    } else if (bldCalciner.on > 0 && proVar < conVar) {
      bldCalciner.on--;
      conVar--;
    } else if (bldAccelerator.on > 0 && proVar < conVar) {
      bldAccelerator.on--;
      conVar--;
    }
  }
}

/**
 * TODO
 */
function autoNip() {
  if (autoCheck['build']) {
    if (gamePage.bld.buildingsData[0].val < 30) {
      console.log('taco');
      $('.btnContent:contains(\'Gather\')').trigger('click');
    }
  }
}

/**
 * TODO
 */
function loadConfigs() {
  if (localStorage.lmg != undefined) {
    var config = JSON.parse(localStorage.lmg);
    assistant.buldings = config.buildings;
  }
}

/**
 * TODO
 */
function saveConfigs() {
  var config = {
    buildings: assistant.buildings,
  };
  localStorage.lmg = JSON.stringify(config);
}

assistant.renderBuildingSelect();
assistant.renderSpaceSelect();
assistant.renderCraftSelect();
$('#footerLinks').append(htmlMenuAddition);

// loadConfigs();

// This function keeps track of the game's ticks and uses math to execute these
// functions at set times relative to the game.
var runAllAutomation;
clearInterval(runAllAutomation);
runAllAutomation = setInterval(function() {
  autoNip();

  if (gamePage.timer.ticksTotal % 3 === 0) {
    autoObserve();
    autoCraft();
    autoHunt();
    autoAssign();
    energyControl();
  }

  if (gamePage.timer.ticksTotal % 10 === 0) {
    autoBuild();
    autoSpace();
    autoPraise();
  }

  if (gamePage.timer.ticksTotal % 25 === 0) {
    autoPromote();
    autoResearch();
    autoWorkshop();
    autoParty();
    autoTrade();
  }
}, 200);
