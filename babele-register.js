var compmod = "wfrp4e-core";

Hooks.on('init', () => {

	game.wfrp4e.entities.ActorWfrp4e.prototype.calculateSpellDamage = function(formula, isMagicMissile) {
		let actorData = this.data
		formula = formula.toLowerCase();
		if (isMagicMissile) // If it's a magic missile, damage includes willpower bonus
		{
			formula += "+ " + actorData.data.characteristics["wp"].bonus
		}
		// Iterate through characteristics
		for (let ch in actorData.data.characteristics) {
			// If formula includes characteristic name
			while (formula.includes(game.i18n.localize(actorData.data.characteristics[ch].label).toLowerCase())) {
				// Determine if it's looking for the bonus or the value
				if (formula.includes('bonus'))
					formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase().concat(" bonus"), actorData.data.characteristics[ch].bonus);
				else
					formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), actorData.data.characteristics[ch].value);
			}
		}

		return eval(formula);
	}

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
			if ( skills_list ) {
			  var i;
			  var len = skills_list.length;
			  var re  = /(.*)\((.*)\)/i;
			  var transl;
			  for (i = 0; i < len; i++) {
				  for (const [key, valueObj] of Object.entries(compendium.translations)) {
					  if (valueObj.id === skills_list[i]){
						  skills_list[i] = valueObj.name;
					  }
				  }
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
			  for (i = 0; i < len; i++) {
				  for (const [key, valueObj] of Object.entries(compendium.translations)) {
					  if (valueObj.id === talents_list[i]){
						  talents_list[i] = valueObj.name;
					  }
				  }
			  }
			}
			return talents_list;      
			},
			// Search back in careers the translated name of the group (as it is the name of the level career itself)
			"career_careergroup": (value) => {
				var compendium = game.packs.find(p => p.collection === compmod + '.careers');

				for (const [key, valueObj] of Object.entries(compendium.translations)) {
					if (valueObj.id === value){
						return valueObj.name;
					}
				}
				return value;
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
						var trait_de = fulltraits.translate( { name: name_en } );
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
						if (trait_de.translated) {
							trait_en.name = trait_de.name + special;
							if ( trait_de.data ) {
								trait_en.data.description.value = trait_de.data.description.value;
							}
						}
					} else if ( trait_en.type == "prayer") {
						var trait_de = fullprayers.translate( { name: name_en } );
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
						trait_en = career_de;
					} else if ( trait_en.type == "trapping" || trait_en.type == "weapon" || trait_en.type == "armour" || trait_en.type == "container" || trait_en.type == "money") {
						var trapping_de = fulltrappings.translate( trait_en );
						trait_en.name = trapping_de.name;
						if ( trapping_de.data) {
							trait_en.data.description  = trapping_de.data.description;
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
						if (!!translations && !!translations['description' + i] && effect.flags.wfrp4e.effectData !== undefined) {
							effect.flags.wfrp4e.effectData.description = translations['description' + i];
						}
						if (!!effect && !!effect.flags && !!effect.flags.wfrp4e && !!effect.flags.wfrp4e.script) {
							effect.flags.wfrp4e.script = effect.flags.wfrp4e.script
								.replace('args.item.name.includes("Language")', 'args.item.name.includes( game.i18n.localize("Language") )')
								.replace('args.item.name.includes("Stealth")', 'args.item.name.includes( game.i18n.localize("Stealth") )')
								.replace('args.item.name == "Track"', 'args.item.name == game.i18n.localize("Track")')
								.replace('args.actor.data.traits.find(t => t.name == \"Undead\"', 'args.actor.data.traits.find(t => t.name == \"Untot\"')
								.replace('args.actor.data.traits.find(t => t.name == \"Daemonic\"', 'args.actor.data.traits.find(t => t.name == \"Dämonisch\"');
						}
					}
				} //ignore when no effects
				return effects
			},
			"spells_effects": (effects) => {
				if (!!effects) {
					for (let i = 0; i < effects.length; i++) {
						let effect = effects[i];
						effect.label = effect.label
							.replace(' (Fire)', '')
							.replace(' (Death)', '')
							.replace(' (Shadow)', '')
							.replace(' (Daemonology)', '')
							.replace(' (Light)', '')
							.replace(' (Life)', '')
							.replace(' (Necromancy)', '')
							.replace(' (Heavens)', '')
							.replace(' (Metal)', '')
							.replace(' (Beasts)', '');
						effect.label = game.i18n.localize( 'EFFECTS.'+effect.label.trim() );
					}
				} //ignore when no effects
				return effects
			},
			"crit_effects": (effects, translations) => {
				for (let i=0; i<effects.length; i++) {
					let effect = effects[i];
					let label = effect.label;
					effect.label = game.i18n.localize( label );
					if (!!effect.flags.wfrp4e.script){
						effect.flags.wfrp4e.script = effect.flags.wfrp4e.script
							.replace('Endurance', 'Ausdauer');
					}
				}
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
			"spells_duration_range_target_damage": (value) => {
				if ( value == "" ) return ""; // Hop !
				if ( value == "Touch" ) return "Berührung"; // Hop !
				if ( value == "You" ) return "Selbst"; // Hop !
				if ( value == "Instant" ) return "Sofort"; // Hop !
				var translw = value;
				var re  = /(.*) Bonus (\w*)/i;
				var res = re.exec( value );
				var unit = "";
				if ( res ) { // Test "<charac> Bonus <unit>" pattern
					if ( res[1] ) { // We have char name, then convert it
						translw = game.i18n.localize( res[1].trim() ) + " Bonus";
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
				if ( unit == "hour") unit = "Stunde";
				if ( unit == "hours") unit = "Stunden";
				if ( unit == "days") unit = "Tage";
				if ( unit == "yard") unit = "meter";
				if ( unit == "yards") unit = "meter";
				if ( unit == "Rounds") unit = "Runden";
				if ( unit == "rounds") unit = "Runden";
				translw += " " + unit;
				return translw;
			},
			"spells_labels": (value) => {
				var translw = value;
				translw  = game.i18n.localize( value );
				return translw;
			}

		});
    }
});