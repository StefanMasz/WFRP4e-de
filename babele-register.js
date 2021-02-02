Hooks.on('init', () => {

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
		  });
    }
});
