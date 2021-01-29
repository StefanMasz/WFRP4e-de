/************************************************************************************/
/* Override some methods of the WFRP4 actor class, mainly to compute spells/weapons */
class ActorWfrp4e_de extends ActorWfrp4e {
 
  /**
   * Calculates a weapon's range or damage formula.
   * 
   * Takes a weapon formula for Damage or Range (SB + 4 or SBx3) and converts to a numeric value.
   * 
   * @param {String} formula formula to be processed (SBx3 => 9).
   * 
   * @return {Number} Numeric formula evaluation
   */
  calculateRangeOrDamage(formula)
  {
    //console.log("DE function calculateRangeOrDamage !", formula);
    let actorData = this.data
    try 
    {
      formula = formula.toLowerCase();
      // Iterate through characteristics
      for(let ch in actorData.data.characteristics)
      {
        // Determine if the formula includes the characteristic's abbreviation + B (SB, WPB, etc.)
        if (formula.includes(ch.concat('b')))
        {
          // Replace that abbreviation with the Bonus value
          formula = formula.replace(ch.concat('b'), actorData.data.characteristics[ch].bonus.toString());
        }
      }
      if (formula.includes("yard") )
        formula = formula.replace('yard', "mètre" );
      if (formula.includes("yds") )
        formula = formula.replace('yds', "m." );
      // To evaluate multiplication, replace x with *
      formula = formula.replace('x', '*');

      return eval(formula);
    }
    catch 
    {
      return formula
    }
  }
  
/**
   * Turns a formula into a processed string for display
   * 
   * Processes damage formula based - same as calculateSpellAttributes, but with additional
   * consideration to whether its a magic missile or not
   * 
   * @param   {String}  formula         Formula to process - "Willpower Bonus + 4" 
   * @param   {boolean} isMagicMissile  Whether or not it's a magic missile - used in calculating additional damage
   * @returns {String}  Processed formula
   */
  calculateSpellDamage(formula, isMagicMissile)
  {
    let actorData = this.data
    formula = formula.toLowerCase();

    if (isMagicMissile) // If it's a magic missile, damage includes willpower bonus
    {
      formula += "+ " + actorData.data.characteristics["wp"].bonus
    }

    // Specific case, to avoid wrong matching with "Force"
    if (formula.includes("force mentale")) 
    {
      // Determine if it's looking for the bonus or the value
      if (formula.includes('bonus')) {
        formula = formula.replace( "bonus de force mentale", actorData.data.characteristics["wp"].bonus);
        formula = formula.replace( "force mentale bonus", actorData.data.characteristics["wp"].bonus);
      } else
        formula = formula.replace("force mentale",  actorData.data.characteristics["wp"].value);
    }
  
    // Iterate through characteristics
    for(let ch in actorData.data.characteristics)
    { 
      // If formula includes characteristic name
      while (formula.includes(actorData.data.characteristics[ch].label.toLowerCase()))
      {
        // Determine if it's looking for the bonus or the value
        if (formula.includes('bonus')) {
          formula = formula.replace("bonus de " + WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].bonus);
          formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase() + " bonus",  actorData.data.characteristics[ch].bonus);
        }
        else
          formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].value);
      }
    }
    
    //console.log("calculateSpellDamage -> " + formula );
    return eval(formula);
  }  
  
  /**
   * Turns a formula into a processed string for display
   * 
   * Turns a spell attribute such as "Willpower Bonus Rounds" into a more user friendly, processed value
   * such as "4 Rounds". If the aoe is checked, it wraps the result in AoE (Result).
   * 
   * @param   {String}  formula   Formula to process - "Willpower Bonus Rounds" 
   * @param   {boolean} aoe       Whether or not it's calculating AoE (changes string return)
   * @returns {String}  formula   processed formula
   */
  calculateSpellAttributes(formula, aoe=false)
  {
    let actorData = this.data
    formula = formula.toLowerCase();

    // Do not process these special values
    if (formula != game.i18n.localize("Vous").toLowerCase() && formula != game.i18n.localize("Special").toLowerCase() && formula != game.i18n.localize("Instantané").toLowerCase())
    {
      // Specific case, to avoid wrong matching with "Force"
      if (formula.includes("force mentale")) 
      {
        // Determine if it's looking for the bonus or the value
        if (formula.includes('bonus')) {
          formula = formula.replace( "bonus de force mentale",  actorData.data.characteristics["wp"].bonus);
          formula = formula.replace( "force mentale bonus",  actorData.data.characteristics["wp"].bonus);
        }
        else
          formula = formula.replace("force mentale",  actorData.data.characteristics["wp"].value);
      }
      if (formula.includes("yard") )
        formula = formula.replace('yard', "meter" );
      if (formula.includes("yds") )
        formula = formula.replace('yds', "m." );
      // Iterate through remaining characteristics
      for(let ch in actorData.data.characteristics)
      {
        // If formula includes characteristic name
        //console.log("Testing :", ch, WFRP4E.characteristics[ch].toLowerCase());
        if (formula.includes(WFRP4E.characteristics[ch].toLowerCase()))
        {
          // Determine if it's looking for the bonus or the value
          if (formula.includes('bonus')) {
            formula = formula.replace("bonus de " + WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].bonus);
            formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase() + " bonus",  actorData.data.characteristics[ch].bonus);
          }
          else
            formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase(),  actorData.data.characteristics[ch].value);
        }
      }
    }

    // If AoE - wrap with AoE ( )
    if (aoe)
      formula = "AoE (" + formula.capitalize() + ")";
    
    //console.log("calculateSpellAttributes -> " + formula );
    return formula.capitalize();
  }
}

/************************************************************************************/
var compmod = "wfrp4e";

/************************************************************************************/
Hooks.once('init', () => {

  // Replace to manage specific bonuses/char. computations
  CONFIG.Actor.entityClass = ActorWfrp4e_de;  
    
  // Check various settings in the installation  
  game.modules.forEach((module, name) => {
    if ( name == "wfrp4e-content" && module.active) {
      compmod = "wfrp4e-content";
    }
  } );
  
  // Babele stuff
  if(typeof Babele !== 'undefined') {
		
		Babele.get().register({
			module: 'WH4-de-translation',
			lang: 'de',
			dir: 'compendium'
		});
        
    Babele.get().registerConverters({
      "career_skills": (skills_list) => {
        var compendium = game.packs.find(p => p.collection === compmod+'.skills');
        //console.log( "Thru here ...", compendium, skills_list);
        if ( skills_list ) { 
          var i;
          var len = skills_list.length;
          var re  = /(.*)\((.*)\)/i;
          for (i = 0; i < len; i++) {
            var transl = compendium.i18nName( { name: skills_list[i] } );
            //console.log("List ...", skills_list[i]);
            if ( transl == skills_list[i] ) {            
              var res = re.exec( skills_list[i]);
              if (res) { 
                //console.log("Matched/split:", res[1], res[2]);
                var subword = game.i18n.localize(res[2].trim() );
                var s1 = res[1].trim() + " ()";
                var translw = compendium.i18nName( { name: s1} );              
                if (translw != s1) {
                  var res2 = re.exec(translw);
                  transl = res2[1] + "(" + subword  + ")";
                } else {
                  s1 = res[1].trim() + " ( )";
                  translw = compendium.i18nName( { name: s1} );
                  var res2 = re.exec(translw);
                  transl = res2[1] + "(" + subword  + ")";
                }  
              }
            }
            skills_list[i] = transl;
          }
        }
        return skills_list;  
      },
      "career_talents": (talents_list) => { 
        var compendium = game.packs.find(p => p.collection === compmod+'.talents');
        var i;
        if ( talents_list ) {
          var len = talents_list.length;
          var re  = /(.*)\((.*)\)/i;
          for (i = 0; i < len; i++) {
            var transl = compendium.i18nName( { name: talents_list[i]} );
            if ( transl == talents_list[i] ) {            
              var res = re.exec( talents_list[i]);
              if (res) { 
                //console.log("Matched/split:", res[1], res[2]);
                var subword = game.i18n.localize(res[2].trim() );
                var s1 = res[1].trim(); // No () in talents table
                var translw = compendium.i18nName( { name: s1 } );
                if (translw != s1) {
                  transl = translw + "(" + subword  + ")";
                } else {
                  s1 = res[1].trim() + " ( )";
                  translw = compendium.i18nName( { name: s1 } );
                  var res2 = re.exec(translw);
                  transl = res2[1] + "(" + subword  + ")";
                }  
              }
            }
            talents_list[i] = transl;
          }
        }
        return talents_list;      
      },
      "npc_characteristics": (chars) => { // Auto-convert char names in the sheet
        for (var key in chars) {
          var char  = chars[key];
          //console.log("Was here !", key, char ); 
          var abrev = char["abrev"];
          let toTransl = "CHAR." + abrev;
          if ( game.i18n.localize( toTransl ) != toTransl) { // Manages unknown language
            char["label"] = game.i18n.localize( "CHAR." + abrev );
            char["abrev"] = game.i18n.localize( "CHARAbbrev." + abrev );
          }
        }
        return chars;
      },
      "bestiary_traits": (beast_traits, translations) => {
        var fulltraits  = game.packs.get(compmod+'.traits');        
        var fullskills  = game.packs.get(compmod+'.skills');        
        var fulltalents = game.packs.get(compmod+'.talents');
        var fullcareers = game.packs.get(compmod+'.careers');
        var fulltrappings = game.packs.get(compmod+'.trappings');
        var fullspells    = game.packs.get(compmod+'.spells');
        var fullprayers   = game.packs.get(compmod+'.prayers');
        var eisitems      = game.packs.get('eis.eisitems');      
        var eisspells     = game.packs.get('eis.eisspells');      
        var ugtalents     = game.packs.get('wfrp4e-unofficial-grimoire.ug-careerstalentstraits');
        var ugspells      = game.packs.get('wfrp4e-unofficial-grimoire.ug-spells');      
        //console.log("Comp :", compmod, fulltraits);
        
        for (let trait_en of beast_traits)
        { 
          var special = "";
          var nbt = "";
          var name_en = trait_en.name.trim(); // strip \r in some traits name
          
          if ( trait_en.type == "trait") {
            if ( name_en.includes("Tentacles") ) { // Process specific Tentacles case
              var re  = /(.d*)x Tentacles/i;
              var res = re.exec( name_en );
              if ( res && res[1] ) 
                nbt = res[1] + "x ";
              name_en = "Tentacles";
            } else if ( name_en.includes("(") && name_en.includes(")") ) { // Then process specific traits name with (xxxx) inside
                var re  = /(.*) \((.*)\)/i;
                var res = re.exec( name_en );
                name_en = res[1]; // Get the root traits name
                special = " (" + game.i18n.localize( res[2].trim() ) + ")"; // And the special keyword
            }
            var trait_de = fulltraits.translate( { name: name_en } );
            //console.log(">>>>> Trait ?", name_en, nbt, trait_de.name, special);
            trait_en.name = nbt + trait_de.name + special;
            if ( trait_de.data && trait_de.data.description && trait_de.data.description.value ) {
              trait_en.data.description.value = trait_de.data.description.value;
            } else if ( eisitems ) { // No description in the FR compendium -> test other compendium if presenr
              trait_de = eisitems.translate( { name: name_en } );
              trait_en.name = nbt + trait_de.name + special;
              if ( trait_de.data && trait_de.data.description && trait_de.data.description.value )
                trait_en.data.description.value = trait_de.data.description.value;              
            }
            if ( isNaN(trait_en.data.specification.value) ) { // This is a string, so translate it
              //console.log("Translating : ", trait_en.data.specification.value);            
              trait_en.data.specification.value = game.i18n.localize( trait_en.data.specification.value.trim() );            
            }
          } else if ( trait_en.type == "skill") {
            if ( name_en.includes("(") && name_en.includes(")") ) { // Then process specific skills name with (xxxx) inside
                var re  = /(.*) +\((.*)\)/i;
                var res = re.exec( name_en );
                name_en = res[1].trim(); // Get the root skill name
                special = " (" + game.i18n.localize( res[2].trim() ) + ")"; // And the special keyword
            }
            var trait_de = fullskills.translate( { name: name_en } );
            //console.log(">>>>> Skill ?", name_en, special, trait_de.name, trait_de);
            if (trait_de.translated) {
              trait_en.name = trait_de.name + special;
              if ( trait_de.data ) {
                trait_en.data.description.value = trait_de.data.description.value;
              }
            }
          } else if ( trait_en.type == "prayer") {
            var trait_de = fullprayers.translate( { name: name_en } );
            //console.log(">>>>> Prayer ?", name_en, special, trait_de.name );
            trait_en.name = trait_de.name + special;
            if ( trait_de.data && trait_de.data.description && trait_de.data.description.value )
              trait_en.data.description.value = trait_de.data.description.value;                                      
          } else if ( trait_en.type == "spell") {
            var trait_de = fullspells.translate( { name: name_en } );
            if ( (!trait_de.data || !trait_de.data.description || !trait_de.data.description.value) && eisspells) { // If no translation, test eisspells
              trait_de = eisspells.translate( { name: name_en } );
            }
            if ( (!trait_de.data || !trait_de.data.description || !trait_de.data.description.value) && ugspells) { // If no translation, test eisspells
              trait_de = ugspells.translate( { name: name_en } );
            }
            //console.log(">>>>> Spell ?", name_en, special, trait_de.name );
            trait_en.name = trait_de.name + special;
            if ( trait_de.data && trait_de.data.description && trait_de.data.description.value )
              trait_en.data.description.value = trait_de.data.description.value;                          
          } else if ( trait_en.type == "talent") {
            if ( name_en.includes("(") && name_en.includes(")") ) { // Then process specific skills name with (xxxx) inside
                var re  = /(.*) +\((.*)\)/i;
                var res = re.exec( name_en );
                name_en = res[1].trim(); // Get the root talent name, no parenthesis this time...
                special = " (" + game.i18n.localize( res[2].trim() ) + ")"; // And the special keyword
            }
            var trait_de = fulltalents.translate( { name: name_en } );
            //console.log(">>>>> Talent ?", name_en, special, trait_de.name);
            if ( (!trait_de.data || !trait_de.data.description || !trait_de.data.description.value) && ugtalents) { // If no translation, test ugtalents
              trait_de =  ugtalents.translate( { name: name_en } );
            }
            if ( trait_de.translated)  {
              trait_en.name = trait_de.name + special;
              if ( trait_de.data ) { // Why ???
                trait_en.data.description.value = trait_de.data.description.value;
              }
            }
          } else if ( trait_en.type == "career") {
            var career_de = fullcareers.translate( trait_en );
            //console.log(">>>>> Career ?", name_en, career_de.name);
            trait_en = career_de;
          } else if ( trait_en.type == "trapping" || trait_en.type == "weapon" || trait_en.type == "armour" || trait_en.type == "container" || trait_en.type == "money") {
            var trapping_de = fulltrappings.translate( trait_en );
            //console.log(">>>>> Trapping ?", name_en, trapping_de.name);
            trait_en.name = trapping_de.name;
            if ( trapping_de.data) {
              trait_en.data.description  = trapping_de.data.description;
            }
          }
        }
        return beast_traits;
      },
      // To avoid duplicateing class for all careers
      "generic_localization": (value) => { 
        if ( value )
          return game.i18n.localize( value.trim() );
      },      
      "trapping_qualities_flaws": (value) => {
        if ( value ) { 
          //console.log("ATOUTS", value);
          var list = value.split( "," );
          var i=0;
          var re  = /(.*) (\d+)/i;        
          for (i=0; i<list.length; i++) {
            let trim = list[i].trim();
            if ( trim == "Trap Blade") {
              trim = "TrapBlade"; // Auto-patch, without space!
              //console.log("PATCHED", trim);
            }           
            var splitted = re.exec( trim );
            //console.log("Current quality", splitted, trim );
            if ( splitted ) {
              //console.log("FOund:", splitted[0], splitted[1], splitted[2] );
              list[i] = game.i18n.localize( splitted[1] ) + " " + splitted[2];
            } else { 
              list[i] = game.i18n.localize( trim ) ;
            }
          }
          return list.toString();
        }
      },
      // Search back in careers the translated name of the groupe (as it is the name of the level career itself)
      "career_careergroup": (value) => { 
        // Manage exception - Dirty hack
        if ( value == 'Druidic Priest' ) {
          return "Druide";
        }
        // Per default
        var compendium = game.packs.find(p => p.collection === compmod+'.careers');
        return compendium.i18nName( { name: value } );
      },
      "mutations_modifier": (value) => { // This is really UGLYYYY i know, but i started like this and discovered afterward that many strings were not easy to automate... Sorry :)
        //console.log("Parsing mutation :", value);
        value = value.toLowerCase();        
        value = value.replace("gain a broken condition if you fail a test derived from ", "gain a broken condition if you fail a test derived from ");
        value = value.replace("weapon skill" ,"weapon skill");
        value = value.replace("ballistic skill", "ballistic skill");
        value = value.replace("strength", "Stärke");
        value = value.replace("toughness", "Widerstand");
        value = value.replace("agility", "Gewandheit");
        value = value.replace("dexterity", "Geschicklichkeit");
        value = value.replace("willpower", "Willenskraft");
        value = value.replace("fellowship", "Charisma");
        value = value.replace("initiative", "Initiative");
        value = value.replace("intelligence", "Intelligenz");
        value = value.replace("armor points to the head", "RP Kopf");
        value = value.replace("subject to frenzy", "Opfer von Raserei");
        value = value.replace("you do not scar", "hinterlässt keine sichtbare Narbe");
        value = value.replace("movement", "Bewegung");
        value = value.replace("armor points to all locations", "RP auf alle Trefferflächen");
        value = value.replace("to any test when alone", "to any test when alone");
        value = value.replace("track", "Spurenlesen");
        value = value.replace("to any test not hurting another", "to any test not hurting another");
        value = value.replace("on tests to hurt", "on tests to hurt")
        value = value.replace("to all language tests when speaking", "to all language tests when speaking");
        value = value.replace("on perception tests involving sight", "on perception tests involving sight");
        value = value.replace("to all Sociabilité tests", "to all Sociabilité tests");
        return value;
      },
      // Auto-translate duration
      "spells_duration_range_target_damage": (value) => {
        //console.log("Spell duration/range/damage/target :", value);
        if ( value == "" ) return ""; // Hop !
        if ( value == "Touch" ) return "Berührung"; // Hop !
        if ( value == "You" ) return "Du"; // Hop !        
        if ( value == "Instant" ) return "Sofort"; // Hop !
        var translw = value;
        var re  = /(.*) Bonus (\w*)/i;
        var res = re.exec( value );
        var unit = "";
        if ( res ) { // Test "<charac> Bonus <unit>" pattern
          if ( res[1] ) { // We have char name, then convert it
            translw = "Bonus de " + game.i18n.localize(  res[1].trim()  );
          }           
          unit = res[2];
        } else { 
          re = /(\d+) (\w+)/i;
          res = re.exec( value );
          if (res) { // Test : "<number> <unit>" pattern
            translw  = res[1];
            unit = res[2];
          } else { // Test 
            re = /(\w+) (\w+)/i;
            res = re.exec( value );
            if (res) { // Test : "<charac> <unit>" pattern
              translw  = game.i18n.localize( res[1].trim() );
              unit = res[2];
            } 
          }
        } 
        if ( unit == "hour") unit = "stunde";
        if ( unit == "hours") unit = "stunden";
        if ( unit == "days") unit = "tage";            
        if ( unit == "yard") unit = "meter";            
        if ( unit == "yards") unit = "meter";            
        translw += " " + unit;
        return translw; 
      }
    });      
  }
  
} );

