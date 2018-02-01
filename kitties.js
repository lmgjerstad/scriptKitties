var assistant = {
  init : function () {
    this.autoCheck = {
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
    this.buildings = {};
    this.resourceList = function () {
      var result = [];
      var seen = {};
      var done = false;
      while (!done) {
        done = true;
        for (var i in gamePage.resPool.resources) {
          var res = gamePage.resPool.resources[i];
          var skip = false;
          if (seen[res.name] != undefined) {
            continue;
          }
          if (res.craftable) {
            var prices = gamePage.workshop.getCraft(res.name).prices;
            for (var j in prices) {
              if (seen[prices[j].name] == undefined) {
                skip = true;
              }
            }
          }
          if (skip) {
            done = false;
          } else {
            result.push(res.name);
            seen[res.name] = true;
          }
        }
      }
      return result.reverse();
    }();
    this.craftPrices = function () {
      var result = {};
      for (var i in gamePage.workshop.crafts) {
        var craft = gamePage.workshop.crafts[i];
        result[craft.name] = {};
        for (var j in craft.prices) {
          result[craft.name][craft.prices[j].name] = craft.prices[j].val;
        }
      }
      return result;
    } ();
    this.primaryResourceList = this.resourceList.filter(function(name) {
      if (!(name in this.craftPrices)) {
        return false;
      }
      for (var sub in this.craftPrices[name]) {
        if (!(sub in this.craftPrices)) {
          return true;
        }
      }
      return false;
    }, this);
  },
  canAfford : function (prices) {
    var costs = {};
    var crafts = [];
    for (var i in prices) {
      costs[prices[i].name] = prices[i].val;
    }
    for (var i in this.resourceList) {
      var name = this.resourceList[i];
      if (name in costs) {
        var have = gamePage.resPool.get(name).value;
        if (have > costs[name]) {
          delete costs[name];
        } else if (name in this.craftPrices) {
          var ratio = gamePage.getCraftRatio(name);
          var count = Math.ceil((costs[name] - have) / ratio);
          for (var cName in this.craftPrices[name]) {
            if (costs[cName] == undefined) {
              costs[cName] = this.craftPrices[name][cName] * count;
            } else {
              costs[cName] += this.craftPrices[name][cName] * count;
            }
          }
          crafts.push([name, count]);
          delete costs[name];
        } else {
          return [false, []];
        }
      }
    }
    return [Object.keys(costs).length === 0, crafts.reverse()];
  },
  renderBuildingSelect : function () {
    var bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-400px; width:600px; column-count: 2;" class="dialog help">' +
    '<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; left: 15px;">space</a>' +
    '<a href="#" onclick="$(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>';
  
    var buildings = {};
    for (var i in gamePage.bld.buildingsData) {
      buildings[gamePage.bld.buildingsData[i].name] = gamePage.bld.buildingsData[i];
    }
    for (var i in gamePage.bld.buildingGroups) {
      var group = gamePage.bld.buildingGroups[i];
      bldSelectAddition += ' <br><label><b>' + group.title + '</b></label><br>'
      for (var j in group.buildings) {
        var name = group.buildings[j];
        var bld = buildings[name];
        var label = bld.label;
        if (label == undefined) {
          label = bld.stages.map(function (x) { return x.label }).join("/");
        }
        bldSelectAddition += ' <label for="auto_' + name + '">' + label +
            '</label><input type="text" id="auto_' + name + '" style="width:25px;"><br>';
      }
    }
  
    bldSelectAddition += '</div>';
  
    $("#game").append(bldSelectAddition);
  
    for (var i in buildings) {
      var name = buildings[i].name;
      var obj = document.getElementById('auto_' + name);
      if (this.buildings[name] == undefined) {
        this.buildings[name] = 0;
      }
      obj.value = this.buildings[name];
      obj.onchange = function(counts, name, obj) {
        return function () {
          counts[name] = obj.value;
        };
      } (this.buildings, name, obj);
    }
  },
  autoBuild : function () {
    if (this.autoCheck['build'] && gamePage.ui.activeTabId == 'Bonfire') {
  
      var btns = gamePage.tabs[0].buttons;
      for (i = 2; i < btns.length; ++i) {
        var btn = btns[i];
        var name = btn.model.metadata.name;
        var building = gamePage.bld.getBuildingExt(name);
        if (building.meta.unlocked && building.meta.val < this.buildings[name]) {
          var can = this.canAfford(gamePage.bld.getPrices(name));
          if (can[0]) {
            for (var i in can[1]) {
              gamePage.craft(can[1][i][0], can[1][i][1]);
            }
            try {
              btn.controller.updateEnabled(btn.model);
              btn.controller.buyItem(btn.model, {}, function(result) {
                if (result) {
                  btn.update();
                  console.log('Purchased ' + name);
                }
              });
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    }
  },
  autoResearch : function () {
    if (this.autoCheck['science'] && gamePage.libraryTab.visible != false) {
      var origTab = gamePage.ui.activeTabId;
  
      var btn = gamePage.tabs[2].buttons;
  
      for (var i = 0; i < btn.length; i++) {
        if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
          var can = this.canAfford(btn[i].model.metadata.prices);
          if (can[0]) {
            for (var i in can[1]) {
              gamePage.craft(can[1][i][0], can[1][i][1]);
            }
            if (gamePage.ui.activeTabId != 'Science') {
              gamePage.ui.activeTabId = 'Science';
              gamePage.render();
            }
            try {
              btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                if (result) {
                  btn[i].update();
                  console.log('Purchased ' + btn[i].model.metadata.label);
                }
              });
            } catch(err) {
              console.log(err);
            }
          }
        }
      }
  
      if (origTab != gamePage.ui.activeTabId) {
        gamePage.ui.activeTabId = origTab; gamePage.render();
      }
    }
  },
  autoWorkshop : function () {
    if (this.autoCheck['upgrade'] && gamePage.workshopTab.visible != false) {
      var origTab = gamePage.ui.activeTabId;
  
      var btn = gamePage.tabs[3].buttons;
  
      for (var i = 0; i < btn.length; i++) {
        if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
          var can = this.canAfford(btn[i].model.metadata.prices);
          if (can[0]) {
            for (var i in can[1]) {
              gamePage.craft(can[1][i][0], can[1][i][1]);
            }
            if (gamePage.ui.activeTabId != 'Workshop') {
              gamePage.ui.activeTabId = 'Workshop';
              gamePage.render();
            }
            try {
              btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                if (result) {
                  btn[i].update();
                  console.log('Purchsed ' + btn[i].model.metadata.label);
                }
              });
            } catch(err) {
              console.log(err);
            }
          }
        }
      }
  
      if (origTab != gamePage.ui.activeTabId) {
        gamePage.ui.activeTabId = origTab;
        gamePage.render();
      }
    }
  },
  autoObserve : function () {
    var checkObserveBtn = document.getElementById("observeBtn");
    if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
      checkObserveBtn.click();
    }
  },
  autoPraise : function (){
    if (this.autoCheck['praise'] && gamePage.bld.getBuildingExt('temple').meta.val > 0) {
      var faith = gamePage.resPool.get('faith');
      if (faith.value > faith.maxValue * 0.99) {
        gamePage.religion.praise();
      }
    }
  },
  autoPromote : function () {
    var count = 0;
    var k = gamePage.village.leader;
    if (k) {
      count += gamePage.village.sim.promote(k);
    }
    for (var i in gamePage.village.sim.kittens) {
      var k = gamePage.village.sim.kittens[i];
      if (k.job == "engineer" && k.rank < 5) {
        count += gamePage.village.sim.promote(k);
      }
    }
    if (count > 0) {
      console.log('Promoted ' + count + ' kittens');
    }
  },
  // TODO(lmgjerstad): Refactor
  autoTrade : function () {
    if (this.autoCheck['trade']) {
      var titRes = gamePage.resPool.get('titanium');
      var unoRes = gamePage.resPool.get('unobtainium');
      var goldResource = gamePage.resPool.get('gold');
      var goldOneTwenty = gamePage.getResourcePerTick('gold') * 200;
        if (goldResource.value / goldResource.maxValue > 0.99) {
          if (unoRes.value > 5000  && gamePage.diplomacy.get('leviathans').unlocked && gamePage.diplomacy.get('leviathans').duration != 0) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("leviathans"));
          } else if (titRes.value < (titRes.maxValue * 0.9)  && gamePage.diplomacy.get('zebras').unlocked) {
            gamePage.diplomacy.tradeAll(game.diplomacy.get("zebras"));
  //        } else if (gamePage.diplomacy.get('dragons').unlocked) {
  //          gamePage.diplomacy.tradeAll(game.diplomacy.get("dragons"));
          }
        }
    }
  },
  autoHunt : function () {
    if (this.autoCheck['hunt']) {
      var catpower = gamePage.resPool.get('manpower');
      if (catpower.value > catpower.maxValue * 0.99) {
        gamePage.village.huntAll();
      }
    }
  },
  craftCaps : {
    blueprint : 500,
    alloy : 4000,
  },
  autoCraft : function () {
    if (this.autoCheck['craft']) {
      for (var i in this.primaryResourceList) {
        var name = this.primaryResourceList[i];
        if (name in this.craftCaps) {
          var res = gamePage.resPool.get(name);
          if (res.value > this.craftCaps[name]) {
            continue;
          }
        }
        var prices = this.craftPrices[name];
        var buy = 0;
        for (var sub in prices) {
          var subRes = gamePage.resPool.get(sub);
          if (subRes.value < prices[sub]) {
            buy = 0;
            break;
          }

          if (subRes.maxValue > 0 && (subRes.value + (10 * subRes.perTickCached) > subRes.maxValue)) {
            buy = Math.max(Math.floor(10 * subRes.perTickCached / prices[sub]), 1);
          }
        }
        if (buy > 0) {
          var priceList = [];
          for (var subName in prices) {
            priceList.push({name : subName, val : prices[subName] * buy});
          }
          var can = this.canAfford(priceList);
          if (can[0]) {
            for (var i in can[1]) {
              gamePage.craft(can[1][i][0], can[1][i][1]);
            }
            gamePage.craft(name, buy);
          }
        }
      }
    }
  },
}

assistant.init();

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
var deadScript = "Script is dead";
var furDerVal = 3;
var autoChoice = "farmer";
var resList = [];
var secResRatio = 0;
var steamOn = 0;
var programBuild = false;


spaceBuildings = {
  spaceElevator : {
    buy : false,
    panel : 0,
  },
  sattelite : {
    buy : false,
    panel : 0,
  },
  spaceStation : {
    buy : false,
    panel : 0,
  },
  moonOutpost : {
    buy : false,
    panel : 1,
  },
  moonBase : {
    buy : false,
    panel : 1,
  },
  planetCracker : {
    buy : false,
    panel : 2,
  },
  hydrofracturer : {
    buy : false,
    panel : 2,
  },
  spiceRefinery : {
    buy : false,
    panel : 2,
  },
  researchVessel : {
    buy : false,
    panel : 3,
  },
  orbitalArray : {
    buy : false,
    panel : 3,
  },
  sunlifter : {
    buy : false,
    panel : 4,
  },
  containmentChamber : {
    buy : false,
    panel : 4,
  },
  cryostation : {
    buy : false,
    panel : 5,
  },
  spaceBeacon : {
    buy : false,
    panel : 6,
  },
  terraformingStation : {
    buy : false,
    panel : 7,
  },
  hydroponics : {
    buy : false,
    panel : 7,
  },
  tectonic : {
    buy : false,
    panel : 8,
  },
}

var crafts = {
  wood : {
    primary : true,
    reserve : 0
  },
  plate : {
    primary : true,
    reserve : 0
  },
  steel : {
    primary : true,
    reserve : 0,
    restrict : "coal"
  },
  slab : {
    primary : true,
    reserve : 0
  },
  beam : {
    primary : true,
    reserve : 0
  },
  kerosene : {
    primary : true,
    reserve : 0
  },
  furs : {
    reserve : 0,
    goal : 0
  },
  starchart : {
    reserve : 0,
    goal : 0
  },
  science : {
    reserve : 0,
    goal : 0
  },
  parchment : {
    reserve : 0,
    goal : 1000
  },
  manuscript : {
    reserve : 0,
    goal : 0
  },
  compedium : {
    reserve : 0,
    goal : 0
  },
  blueprint : {
    reserve : 0,
    goal : 0
  },
  scaffold : {
    reserve : 0,
    goal : 0
  },
  ship : {
    reserve : 0,
    goal : 0
  },
  alloy : {
    reserve : 0,
    goal : 0
  },
  gear : {
    reserve : 0,
    goal : 0
  },
  concrate : {
    reserve : 0,
    goal : 0
  }
}

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
'<select id="craftFur" size="1" onclick="setFurValue()">' +
'<option value="1" selected="selected">Parchment</option>' +
'<option value="2">Manuscript</option>' +
'<option value="3">Compendium</option>' +
'<option value="4">Blueprint</option>' +
'</select></br></br>' +

'<label id="secResLabel"> Secondary Craft % </label>' +
'<span id="secResSpan" title="Between 0 and 100"><input id="secResText" type="text" style="width:25px" onchange="secResRatio = this.value" value="30"></span></br></br>' +


'<button id="autoHunt" style="color:red" onclick="autoSwitch(\'hunt\', this)"> Auto Hunt </button></br>' +
'<button id="autoTrade" style="color:red" onclick="autoSwitch(\'trade\', this)"> Auto Trade </button></br>' +
'<button id="autoPraise" style="color:red" onclick="autoSwitch(\'praise\', this)"> Auto Praise </button></br></br>' +
'<button id="autoScience" style="color:red" onclick="autoSwitch(\'science\', this)"> Auto Science </button></br>' +
'<button id="autoUpgrade" style="color:red" onclick="autoSwitch(\'upgrade\', this)"> Auto Upgrade </button></br>' +
'<button id="autoEnergy" style="color:red" onclick="autoSwitch(\'energy\', this)"> Energy Control </button></br>' +
'<button id="autoParty" style="color:red" onclick="autoSwitch(\'party\', this)"> Auto Party </button></br></br>' +
'</div>' +
'</div>'


function clearOptionHelpDiv() {
  $("#optionSelect").hide();
}

function selectOptions() {
  $("#optionSelect").toggle();
}

function clearHelpDiv() {
  $("#buildingSelect").hide();
}

function selectBuildings() {
  $("#buildingSelect").toggle();
}

function setFurValue() {
  furDerVal = $('#craftFur').val();
}

function setAutoAssignValue() {
  autoChoice = $('#autoAssignChoice').val();
}

function autoSwitch(name, btn) {
  autoCheck[name] = !autoCheck[name];
  gamePage.msg(btn.textContent + ' is now ' + (autoCheck[name] ? 'on' : 'off'));
  btn.style.color = autoCheck[name] ? 'black' : 'red';
}

function clearScript() {
  $("#farRightColumn").remove();
  $("#buildingSelect").remove();
  $("#spaceSelect").remove();
  $("#scriptOptions").remove();
  clearInterval(runAllAutomation);
  autoBuildCheck = null;
  bldSelectAddition = null;
  spaceSelectAddition = null;
  htmlMenuAddition = null;
}

        // Show current kitten efficiency in the in-game log
function kittenEfficiency() {
  var timePlayed = gamePage.stats.statsCurrent[3].calculate(game);
  var numberKittens = gamePage.resPool.get('kittens').value;
  var curEfficiency = (numberKittens - 70) / timePlayed;
  gamePage.msg("Your current efficiency is " + parseFloat(curEfficiency).toFixed(2) + " kittens per hour.");
}


/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */
/* These are the functions which are controlled by the runAllAutomation timer */


    // Auto Observe Astronomical Events
function autoObserve() {
  assistant.autoObserve();
}

  // Auto praise the sun
function autoPraise(){
  assistant.autoPraise();
}

    // Build buildings automatically
function autoBuild() {
  assistant.autoBuild();
}

    // Build space stuff automatically
function autoSpace() {
//if (autoCheck['build']) {
//
//  var origTab = gamePage.ui.activeTabId;
//
//    // Build space buildings
//  for (var z = 32; z < buildings.length; z++) {
//    if (buildings[z][1] != false) {
//
//    var spBuild = gamePage.tabs[6].planetPanels[buildings[z][2]].children;
//
//      try {
//        for (i = 0 ;i < spBuild.length; i++) {
//          if (spBuild[i].model.metadata.name == buildingsList[z]) {
//
//            if (gamePage.ui.activeTabId != "Space") {
//              gamePage.ui.activeTabId = 'Space'; gamePage.render(); // Change the tab so that we can build
//            }
//
//            spBuild[i].controller.buyItem(spBuild[i].model, {}, function(result) {
//              if (result) {spBuild[i].update();}
//              });
//          }
//        }
//      } catch(err) {
//      console.log(err);
//      }
//
//    }
//  }
//
//    // Build space programs
//  if (programBuild != false) {
//    var spcProg = gamePage.tabs[6].GCPanel.children;
//    for (var i = 0; i < spcProg.length; i++) {
//      if (spcProg[i].model.metadata.unlocked && spcProg[i].model.on == 0) {
//        try {
//
//          if (gamePage.ui.activeTabId != "Space") {
//          gamePage.ui.activeTabId = 'Space'; gamePage.render(); // Change the tab so that we can build
//          }
//
//          spcProg[i].controller.buyItem(spcProg[i].model, {}, function(result) {
//            if (result) {spcProg[i].update();}
//            });
//        } catch(err) {
//        console.log(err);
//        }
//      }
//    }
//  }
//
//        if (origTab != gamePage.ui.activeTabId) {
//        gamePage.ui.activeTabId = origTab; gamePage.render();
//      }
//
//}
}

function autoPromote() {
  assistant.autoPromote();
}

    // Trade automatically
function autoTrade() {
  assistant.autoTrade();
}

    // Hunt automatically
function autoHunt() {
  assistant.autoHunt();
}

function canAfford(prices, reserve) {
  var cap = Infinity;
  for (var i in prices) {
    var name = prices[i].name;
    var resource = gamePage.resPool.get(name);
    var res = reserve ? crafts[name] ? crafts[name].reserve : 0 : 0;
    cap = Math.min(cap, (resource.value - res) / prices[i].val);
  }
  return Math.floor(cap);
}

    
    // Craft primary resources automatically
function autoCraft() {
  assistant.autoCraft();
//  if (autoCheck['craft']) {
//    for (var name in crafts) {
//      if (crafts[name].goal === 0) {
//        continue;
//      }
//      var craft = gamePage.workshop.getCraft(name);
//      var prices = craft.prices;
//      var buy = 0;
//      if (crafts[name].primary) {
//        for (var i in prices) {
//          var resName = prices[i].name
//          var curRes = gamePage.resPool.get(resName);
//          if (curRes.value < prices[i].val) {
//            buy = 0;
//            break;
//          }
//          if (crafts[name].restrict && crafts[name].restrict != resName) {
//            continue;
//          }
//          if (curRes.maxValue > 0 && (curRes.value / curRes.maxValue) > 0.99) {
//            buy = Math.max(Math.floor(curRes.maxValue / 100 / prices[i].val), 1);
//          }
//        }
//      } else {
//        var goal = crafts[name].goal;
//        var current = gamePage.resPool.get(name).value;
//        var needed = goal - current;
//        var ratio = game.getResCraftRatio({name: name}) + 1;
//        buy = Math.min(Math.ceil(needed / ratio), canAfford(prices, true));;
//      }
//      if (buy > 0) {
//        gamePage.craft(name, buy);
//      }
//    }
//  }
}


    // Auto Research
function autoResearch() {
  assistant.autoResearch();
}

    // Auto Workshop upgrade , tab 3
function autoWorkshop() {
  assistant.autoWorkshop();
}

    // Festival automatically
function autoParty() {
  if (autoCheck['party'] && gamePage.science.get("drama").researched) {
    var catpower = gamePage.resPool.get('manpower').value;
    var culture = gamePage.resPool.get('culture').value;
    var parchment = gamePage.resPool.get('parchment').value;

    if (catpower > 1500 && culture > 5000 && parchment > 2500) {
      if (gamePage.prestige.getPerk("carnivals").researched)
        gamePage.village.holdFestival(1);
      else if (gamePage.calendar.festivalDays = 0) {
        gamePage.village.holdFestival(1);
      }
    }

  }
}

    // Auto assign new kittens to selected job
function autoAssign() {
  if (autoCheck['assign'] && gamePage.village.getJob(autoChoice).unlocked && gamePage.village.getFreeKittens() > 0) {
    gamePage.village.assignJob(gamePage.village.getJob(autoChoice));
  }
}

    // Control Energy Consumption
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

function autoNip() {
  if (autoCheck['build']) {
    if (gamePage.bld.buildingsData[0].val < 30) {
      console.log("taco");
      $(".btnContent:contains('Gather')").trigger("click");
    }
  }
}

function maxPossible(name) {
  var bld = gamePage.bld.getBuildingExt(name);
  var prices = bld.meta.prices
  var ratio_log = Math.log(gamePage.bld.getPriceRatio(name));
  var possible = Infinity;
  for (var i in prices) {
    var res_limit = gamePage.resPool.get(prices[i].name).maxValue;
    if (res_limit > 0) {
      var local_max = Math.log(res_limit / prices[i].val) / ratio_log;
      possible = Math.min(possible, local_max);
    }
  }
  return Math.floor(possible) + 1;
}

function loadConfigs() {
  if (localStorage.lmg != undefined) {
    var config = JSON.parse(localStorage.lmg);
    buldings = config.buildings;
    crafts = config.crafts;
  }
}

function saveConfigs() {
  var config = {
    buildings : buildings,
    crafts : crafts,
  }
  localStorage.lmg = JSON.stringify(config);
}

loadConfigs();
assistant.renderBuildingSelect();
$("#footerLinks").append(htmlMenuAddition);

    // This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
clearInterval(runAllAutomation);
var runAllAutomation = setInterval(function() {

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
