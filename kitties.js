
 // These control the button statuses
var autoCheck = {
  build: false,
  craft: false,
  hunt: false,
  trade: false,
  praise: false,
  science: false,
  upgrade: false,
  party: false,
  assign: false,
  energy: false};

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
var tickDownCounter = 1;
var deadScript = "Script is dead";
var furDerVal = 3;
var autoChoice = "farmer";
var resList = [];
var secResRatio = 0;
var steamOn = 0;
var programBuild = false;


var buildings = {
  hut : {
    name : 'Kitten Housing',
    buildings : {
      hut : {
        name : 'Hut',
        buy : false,
      },
      logHouse : {
        name : 'Log House',
        buy : false,
      },
      mansion : {
        name : 'Mansion',
        buy : false,
      },
    }
  },
  craft : {
    name : 'Craft Bonuses',
    buildings : {
      workshop : {
        name : 'Workshop',
        buy : false,
      },
      factory : {
        name : 'Factory',
        buy : false,
      },
    },
  },
  prod : {
    name : 'Production',
    buildings : {
      field : {
        name : 'Catnip Field',
        buy : false,
      },
      pasture : {
        name : 'Pasture/Solar',
        buy : false,
      },
      mine : {
        name : 'Mine',
        buy : false,
      },
      lumberMill : {
        name : 'Lumber Mill',
        buy : false,
      },
      aqueduct : {
        name : 'Aquaduct/Hydro',
        buy : false,
      },
      oilWell : {
        name : 'Oil Well',
        buy : false,
      },
      quarry : {
        name : 'Quarry',
        buy : false,
      },
    },
  },
  conversion : {
    name : 'Conversion',
    buildings : {
      smelter : {
        name : 'Smelter',
        buy : false,
      },
      biolab : {
        name : 'BioLab',
        buy : false,
      },
      calciner : {
        name : 'Calciner',
        buy : false,
      },
      reactor : {
        name : 'Reactor',
        buy : false,
      },
      accelerator : {
        name : 'Accelerator',
        buy : false,
      },
      steamworks : {
        name : 'Steamworks',
        buy : false,
      },
      magneto : {
        name : 'Magneto',
        buy : false,
      },
    },
  },
  science : {
    name : 'Science',
    buildings : {
      library : {
        name : 'Library',
        buy : false,
      },
      academy : {
        name : 'Academy',
        buy : false,
      },
      observatory : {
        name : 'Observatory',
        buy : false,
      },
    },
  },
  storage : {
    name : 'Storage',
    buildings : {
      barn : {
        name : 'Barn',
        buy : false,
      },
      harbor : {
        name : 'Harbor',
        buy : false,
      },
      warehouse : {
        name : 'Warehouse',
        buy : false,
      },
    },
  },
  other : {
    name : 'Other',
    buildings : {
      amphitheatre : {
        name : 'Amphitheatre/Broadcast Tower',
        buy : false,
      },
      tradepost : {
        name : 'Tradepost',
        buy : false,
      },
      chapel : {
        name : 'Chapel',
        buy : false,
      },
      temple : {
        name : 'Temple',
        buy : false,
      },
      mint : {
        name : 'Mint',
        buy : false,
      },
      ziggurat : {
        name : 'Ziggurat',
        buy : false,
      },
      unicornPasture : {
        name : 'Unicorn Pasture',
        buy : false,
      },
    },
  },
}

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
    reserve : 0,
  },
  plate : {
    primary : true,
    reserve : 0,
  },
  steel : {
    primary : true,
    reserve : 0,
    restrict : 'coal',
  },
  slab : {
    primary : true,
    reserve : 0,
  },
  beam : {
    primary : true,
    reserve : 500,
  },
  kerosene : {
    primary : true,
    reserve : 0,
  },
  furs : {
    reserve : 500,
    goal : 0, // Don't actually craft this
  },
  starchart : {
    reserve : 500,
    goal : 0,
  },
  science : {
    reserve : 0,
    goal : 0,
  },
  parchment : {
    reserve : 0,
    goal : 1000,
  },
  manuscript : {
    reserve : 200,
    goal : 1000,
  },
  compedium : {
    reserve : 100,
    goal : 1000,
  },
  blueprint : {
    reserve : 0,
    goal : 500,
  },
  scaffold : {
    reserve : 150,
    goal : 300,
  },
  ship : {
    reserve : 0,
    goal : 1000,
  },
  alloy : {
    reserve : 0,
    goal : 100,
  },
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

$("#footerLinks").append(htmlMenuAddition);

function renderBuildingSelect() {
  var bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-400px; width:200px" class="dialog help">' +
  '<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; left: 15px;">space</a>' +
  '<a href="#" onclick="$(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>';

  for (var category in buildings) {
    var categoryId = category + 'Checker'
    bldSelectAddition += ' <br><input type="checkbox" id="' + categoryId +
        '"><label for="' + categoryId + '"><b>' + buildings[category]['name'] +
        '</b></label><br>'
    for (var name in buildings[category]['buildings']) {
      var bld = buildings[category]['buildings'][name];
      bldSelectAddition += ' <input type="checkbox" id="auto_' + name +
          '" class="' + categoryId + '"><label for="auto_' + name + '">' +
          bld.name + '</label><br>';
    }
  }

  bldSelectAddition += '</div>';

  $("#game").append(bldSelectAddition);

  for (category in buildings) {
    document.getElementById(category + 'Checker').onclick = function(category) {
      return function () { $('.' + category + 'Check').click(); };
    } (category);

    for (var name in buildings[category]['buildings']) {
      var obj = document.getElementById('auto_' + name)
      obj.onclick = function(category, name, obj) {
        return function () {
          buildings[category]['buildings'][name]['buy'] = obj.checked;
        }
      }(category, name, obj);
    }
  }


//var spaceSelectAddition = '<div id="spaceSelect" style="display:none; margin-top:-400px; width:200px" class="dialog help">' +
//'<a href="#" onclick="$(\'#spaceSelect\').hide(); $(\'#buildingSelect\').toggle();" style="position: absolute; top: 10px; left: 15px;">cath</a>' +
//'<a href="#" onclick="$(\'#spaceSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' +
//
//' </br></br><input type="checkbox" id="programs" class="programs" onchange="programBuild = this.checked; console.log(this.checked);"><label for="programs">Programs</label></br></br>' +
//
//' <input type="checkbox" id="spaceChecker"><label for="spaceChecker" onclick="$(\'.spaceCheck\').click();"><b>Space</b></label></br>' +
//
//' <input type="checkbox" id="elevSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'32\', \'elevSBld\');"><label for="elevSBld">Space Elevator</label></br>' +
//' <input type="checkbox" id="satSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'33\', \'satSBld\');"><label for="satSBld">Satellite</label></br>' +
//' <input type="checkbox" id="statSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'34\', \'statSBld\');"><label for="statSBld">Space Station</label></br></br>' +
//
//' <input type="checkbox" id="moonChecker"><label for="moonChecker" onclick="$(\'.moonCheck\').click();"><b>Moon</b></label></br>' +
//
//' <input type="checkbox" id="outSBld" class="moonCheck" onchange="verifyBuildingSelected(\'35\', \'outSBld\');"><label for="outSBld">Lunar Outpost</label></br>' +
//' <input type="checkbox" id="baseSBld" class="moonCheck" onchange="verifyBuildingSelected(\'36\', \'baseSBld\');"><label for="baseSBld">Moon Base</label></br></br>' +
//
//' <input type="checkbox" id="duneChecker"><label for="duneChecker" onclick="$(\'.duneCheck\').click();"><b>Dune</b></label></br>' +
//
//
//' <input type="checkbox" id="crackSBld" class="duneCheck" onchange="verifyBuildingSelected(\'37\', \'crackSBld\');"><label for="crackSBld">Planet Cracker</label></br>' +
//' <input type="checkbox" id="fracSBld" class="duneCheck" onchange="verifyBuildingSelected(\'38\', \'fracSBld\');"><label for="fracSBld">Hydro Fracturer</label></br>' +
//' <input type="checkbox" id="spiceSBld" class="duneCheck" onchange="verifyBuildingSelected(\'39\', \'spiceSBld\');"><label for="spiceSBld">Spice Refinery</label></br></br>' +
//
//' <input type="checkbox" id="piscineChecker"><label for="piscineChecker" onclick="$(\'piscineCheck\').click();"><b>Piscine</b></label></br>' +
//
//' <input type="checkbox" id="reVeSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'40\', \'reVeSBld\');"><label for="reVeSBld">Research Vessel</label></br>' +
//' <input type="checkbox" id="orbSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'41\', \'orbSBld\');"><label for="orbSBld">Orbital Array</label></br></br>' +
//
//' <input type="checkbox" id="heliosChecker"><label for="heliosChecker" onclick="$(\'.heliosCheck\').click();"><b>Helios</b></label></br>' +
//
//' <input type="checkbox" id="sunSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'42\', \'sunSBld\');"><label for="sunSBld">Sunlifter</label></br>' +
//' <input type="checkbox" id="contSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'43\', \'contSBld\');"><label for="contSBld">Containment Chamber</label></br></br>' +
//
//' <input type="checkbox" id="terminusChecker"><label for="terminusChecker" onclick="$(\'.terminusCheck\').click();"><b>Terminus</b></label></br>' +
//
//' <input type="checkbox" id="crySBld" class="terminusCheck" onchange="verifyBuildingSelected(\'44\', \'crySBld\');"><label for="crySBld">Cryostation</label></br></br>' +
//
//' <input type="checkbox" id="kairoChecker"><label for="kairoChecker" onclick="$(\'.kairoCheck\').click();"><b>Kairo</b></label></br>' +
//
//' <input type="checkbox" id="beacSBld" class="kairoCheck" onchange="verifyBuildingSelected(\'45\', \'beacSBld\');"><label for="beacSBld">Space Beacon</label></br></br>' +
//
//' <input type="checkbox" id="yarnChecker"><label for="yarnChecker" onclick="$(\'.yarnCheck\').click();"><b>Yarn</b></label></br>' +
//
//' <input type="checkbox" id="terrSBld" class="yarnCheck" onchange="verifyBuildingSelected(\'46\', \'terrSBld\');"><label for="terrSBld">Terraforming Station</label></br>' +
//' <input type="checkbox" id="hydrSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'47\', \'hydrSBld\');"><label for="hydrSBld">Hydroponics</label></br></br>' +
//
//' <input type="checkbox" id="centaurusChecker"><label for="centaurusChecker" onclick="$(\'.centaurusCheck\').click();"><b>Centaurus System</b></label></br>' +
//
//' <input type="checkbox" id="tecSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'48\', \'tecSBld\');"><label for="tecSBld">Tectonic</label></br></br>' +
//
//'</div>'
//
//function verifyBuildingSelected(buildingNumber, buildingCheckID) {
//  var bldIsChecked = document.getElementById(buildingCheckID).checked;
//  buildings[buildingNumber][1] = bldIsChecked;
//}
//
//  $("#game").append(spaceSelectAddition);
}

renderBuildingSelect();

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
  var checkObserveBtn = document.getElementById("observeBtn");
  if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
    checkObserveBtn.click();
  }

}

  // Auto praise the sun
function autoPraise(){
  if (autoCheck['praise'] && gamePage.bld.getBuildingExt('temple').meta.val > 0) {
    var faith = gamePage.resPool.get('faith');
    if (faith.value > faith.maxValue * 0.99) {
      gamePage.religion.praise();
    }
  }
}

    // Build buildings automatically
function autoBuild() {
  if (autoCheck['build'] && gamePage.ui.activeTabId == 'Bonfire') {

    var btn = gamePage.tabs[0].buttons;

    for (var category in buildings) {
      for (var name in buildings[category]['buildings']) {
        if (buildings[category]['buildings'][name]['buy']) {
          gamePage.bld.getBuildingExt(name).meta.unlocked;
          for (i = 2 ;i < gamePage.tabs[0].buttons.length; i++) {
            try {
              if (btn[i].model.metadata.name == name) {
                btn[i].controller.buyItem(btn[i].model, {}, function(result) {
                  if (result) {
                    btn[i].update();
                    console.log('Purchased ' + name);
                  }
                });
              }
            } catch(err) {
              console.log(err);
            }
          }
        }
      }
    }
  }
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

    // Trade automatically
function autoTrade() {
  if (autoCheck['trade']) {
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
}

    // Hunt automatically
function autoHunt() {
  if (autoCheck['hunt']) {
    var catpower = gamePage.resPool.get('manpower');
    if (catpower.value > catpower.maxValue * 0.99) {
      gamePage.village.huntAll();
    }
  }
}

    // Craft primary resources automatically
function autoCraft() {
  if (autoCheck['craft']) {
    for (var name in crafts) {
      if (crafts[name].goal === 0) {
        continue;
      }
      var craft = gamePage.workshop.getCraft(name);
      var prices = craft.prices;
      var buy = 0;
      if (crafts[name].primary) {
        for (var i in prices) {
          var resName = prices[i].name
          var curRes = gamePage.resPool.get(resName);
          if (curRes.value < prices[i].val) {
            buy = 0;
            break;
          }
          if (crafts[name].restrict && crafts[name].restrict != resName) {
            continue;
          }
          if (curRes.maxValue > 0 && (curRes.value / curRes.maxValue) > 0.99) {
            buy = 1;
          }
        }
      } else {
        var goal = crafts[name].goal;
        var current = gamePage.resPool.get(name).value;
        var needed = goal - current;
        var ratio = game.getResCraftRatio({name: name}) + 1;
        buy = needed / ratio;
        for (var i in prices) {
          var resName = prices[i].name;
          var curRes = gamePage.resPool.get(resName);
          var reserved = crafts[resName] ? crafts[resName].reserve : 0;
          var available = curRes.value - reserved;
          var maxSpend = Math.floor(available / prices[i].val);
          buy = Math.min(buy, maxSpend);
        }
      }
      if (buy > 0) {
        gamePage.craft(name, Math.floor(buy));
      }
    }
  }
}

    // Auto Research
function autoResearch() {
if (autoCheck['science'] && gamePage.libraryTab.visible != false) {
  var origTab = gamePage.ui.activeTabId;
  gamePage.ui.activeTabId = 'Science'; gamePage.render();

  var btn = gamePage.tabs[2].buttons;

   for (var i = 0; i < btn.length; i++) {
    if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
      try {
        btn[i].controller.buyItem(btn[i].model, {}, function(result) {
          if (result) {btn[i].update();}
          });
      } catch(err) {
      console.log(err);
      }

    }
  }

      if (origTab != gamePage.ui.activeTabId) {
        gamePage.ui.activeTabId = origTab; gamePage.render();
      }
}


}

    // Auto Workshop upgrade , tab 3
function autoWorkshop() {
if (autoCheck['upgrade'] && gamePage.workshopTab.visible != false) {

  var origTab = gamePage.ui.activeTabId;
  gamePage.ui.activeTabId = 'Workshop'; gamePage.render();

  var btn = gamePage.tabs[3].buttons;

   for (var i = 0; i < btn.length; i++) {
    if (btn[i].model.metadata.unlocked && btn[i].model.metadata.researched != true) {
      try {
        btn[i].controller.buyItem(btn[i].model, {}, function(result) {
          if (result) {btn[i].update();}
          });
      } catch(err) {
      console.log(err);
      }

    }
  }

    if (origTab != gamePage.ui.activeTabId) {
    gamePage.ui.activeTabId = origTab; gamePage.render();
    }
}

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
  if (autoCheck['assign'] && gamePage.village.getJob(autoChoice).unlocked) {
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

    // This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
clearInterval(runAllAutomation);
var runAllAutomation = setInterval(function() {

  autoNip();
  autoPraise();
  autoBuild();

  if (gamePage.timer.ticksTotal % 3 === 0) {
    autoObserve();
    autoCraft();
    autoHunt();
    autoAssign();
    energyControl();
  }

  if (gamePage.timer.ticksTotal % 10 === 0) {
    autoSpace();
  }

  if (gamePage.timer.ticksTotal % 25 === 0) {

    autoResearch();
    autoWorkshop();
    autoParty();
    autoTrade();

  }

}, 200);
