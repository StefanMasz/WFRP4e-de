var compmod = "wfrp4e-core";

Hooks.on('init', () => {

	// Check various settings in the installation  
	game.modules.forEach((module, name) => {
	if ( name == "wfrp4e-content" && module.active) {
	  compmod = "wfrp4e-content";
	}
	});
	
	if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'WH4-de-translation',
            lang: 'de',
            dir: 'compendium'
        });
		Babele.get().registerConverters({
			"career_skills": (skills_list) => {
			var compendium = game.packs.find(p => p.collection === compmod+'.skills');
			//console.log( "Thru here ...", compmod, skills_list);
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
			// To avoid duplicateing class for all careers
			"generic_localization": (value) => { 
			if ( value )
			  return game.i18n.localize( value.trim() );
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
			// Search back in careers the translated name of the group (as it is the name of the level career itself)
			"career_careergroup": (value) => {
				var compendium = game.packs.find(p => p.collection === compmod+'.careers');
				return compendium.i18nName( { name: value } );
			},
			"trapping_qualities_flaws": (value) => {
				if ( value ) {
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
						if ( splitted ) {
							list[i] = game.i18n.localize( splitted[1] ) + " " + splitted[2];
						} else {
							list[i] = game.i18n.localize( trim ) ;
						}
					}
					return list.toString();
				}
			},
			"npc_characteristics": (chars) => { // Auto-convert char names in the sheet
				for (var key in chars) {
					var char  = chars[key];
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
						var trait_fr = fulltraits.translate( { name: name_en } );
						//console.log(">>>>> Trait ?", name_en, nbt, trait_fr.name, special);
						trait_en.name = nbt + trait_fr.name + special;
						if ( trait_fr.data && trait_fr.data.description && trait_fr.data.description.value ) {
							trait_en.data.description.value = trait_fr.data.description.value;
						} else if ( eisitems ) { // No description in the FR compendium -> test other compendium if presenr
							trait_fr = eisitems.translate( { name: name_en } );
							trait_en.name = nbt + trait_fr.name + special;
							if ( trait_fr.data && trait_fr.data.description && trait_fr.data.description.value )
								trait_en.data.description.value = trait_fr.data.description.value;
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
						var trait_fr = fullskills.translate( { name: name_en } );
						//console.log(">>>>> Skill ?", name_en, special, trait_fr.name, trait_fr);
						if (trait_fr.translated) {
							trait_en.name = trait_fr.name + special;
							if ( trait_fr.data ) {
								trait_en.data.description.value = trait_fr.data.description.value;
							}
						}
					} else if ( trait_en.type == "prayer") {
						var trait_fr = fullprayers.translate( { name: name_en } );
						//console.log(">>>>> Prayer ?", name_en, special, trait_fr.name );
						trait_en.name = trait_fr.name + special;
						if ( trait_fr.data && trait_fr.data.description && trait_fr.data.description.value )
							trait_en.data.description.value = trait_fr.data.description.value;
					} else if ( trait_en.type == "spell") {
						var trait_fr = fullspells.translate( { name: name_en } );
						if ( (!trait_fr.data || !trait_fr.data.description || !trait_fr.data.description.value) && eisspells) { // If no translation, test eisspells
							trait_fr = eisspells.translate( { name: name_en } );
						}
						if ( (!trait_fr.data || !trait_fr.data.description || !trait_fr.data.description.value) && ugspells) { // If no translation, test eisspells
							trait_fr = ugspells.translate( { name: name_en } );
						}
						//console.log(">>>>> Spell ?", name_en, special, trait_fr.name );
						trait_en.name = trait_fr.name + special;
						if ( trait_fr.data && trait_fr.data.description && trait_fr.data.description.value )
							trait_en.data.description.value = trait_fr.data.description.value;
					} else if ( trait_en.type == "talent") {
						if ( name_en.includes("(") && name_en.includes(")") ) { // Then process specific skills name with (xxxx) inside
							var re  = /(.*) +\((.*)\)/i;
							var res = re.exec( name_en );
							name_en = res[1].trim(); // Get the root talent name, no parenthesis this time...
							special = " (" + game.i18n.localize( res[2].trim() ) + ")"; // And the special keyword
						}
						var trait_fr = fulltalents.translate( { name: name_en } );
						//console.log(">>>>> Talent ?", name_en, special, trait_fr.name);
						if ( (!trait_fr.data || !trait_fr.data.description || !trait_fr.data.description.value) && ugtalents) { // If no translation, test ugtalents
							trait_fr =  ugtalents.translate( { name: name_en } );
						}
						if ( trait_fr.translated)  {
							trait_en.name = trait_fr.name + special;
							if ( trait_fr.data ) { // Why ???
								trait_en.data.description.value = trait_fr.data.description.value;
							}
						}
					} else if ( trait_en.type == "career") {
						var career_fr = fullcareers.translate( trait_en );
						//console.log(">>>>> Career ?", name_en, career_fr.name);
						trait_en = career_fr;
					} else if ( trait_en.type == "trapping" || trait_en.type == "weapon" || trait_en.type == "armour" || trait_en.type == "container" || trait_en.type == "money") {
						var trapping_fr = fulltrappings.translate( trait_en );
						//console.log(">>>>> Trapping ?", name_en, trapping_fr.name);
						trait_en.name = trapping_fr.name;
						if ( trapping_fr.data) {
							trait_en.data.description  = trapping_fr.data.description;
						}
					}
				}
				return beast_traits;
			},
			"effects": (effects, translations) => {
				if (!!effects) {
					for (let i = 0; i < effects.length; i++) {
						let effect = effects[i];
						if (!!translations && !!translations['label' + i]) {
							effect.label = translations['label' + i];
						} //ignore missing translations
					}
				} //ignore when no effects
				return effects
			},
			"spells_effects": (effects) => {
				if (!!effects) {
					for (let i = 0; i < effects.length; i++) {
						let effect = effects[i];
						effect.label = game.i18n.localize( effect.label.trim() );
					}
				} //ignore when no effects
				return effects
			},
			"diseases_effects": (effects, translations) => {
				for (let i=0; i<effects.length; i++) {
					let effect = effects[i];
					let label = effect.label;
					let gravity = "";
					if ( label.includes("(") && label.includes(")") ) { // Then process specific skills name with (xxxx) inside
						var re  = /(.*) +\((.*)\)/i;
						var res = re.exec( label );
						label = res[1].trim(); // Get the gravity
						gravity = " (" + game.i18n.localize( res[2].trim() ) + ")"; // And the special keyword
					}
					effect.label = game.i18n.localize( label ) + gravity;
				}
			},

		});
    }
});