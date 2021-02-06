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
			// Auto-translate duration
			"spells_duration_range_target_damage": (value) => {
				//console.log("Spell duration/range/damage/target :", value);
				if ( value == "" ) return ""; // Hop !
				if ( value == "Touch" ) return "Berührung"; // Hop !
				if ( value == "You" ) return "Du selbst"; // Hop !
				if ( value == "Instant" ) return "Sofort"; // Hop !
				var translw = value;
				var re  = /(.*) Bonus (\w*)/i;
				var res = re.exec( value );
				var unit = "";
				if ( res ) { // Test "<charac> Bonus <unit>" pattern
					if ( res[1] ) { // We have char name, then convert it
						translw = "Bonus " + game.i18n.localize(  res[1].trim()  );
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
				translw += " " + unit;
				return translw;
			}
		});
    }
});