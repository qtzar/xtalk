function checkAuth(){
	if (context.getUser().getCommonName() == "Anonymous"){
		sessionScope.put("entryPage",context.getUrl().getPath() + context.getUrl().getQueryString())
		context.redirectToPage("/login.xsp");
	}
}

function checkBrowser(){
	sessionScope.put("browserType","browser")
	// The following is commented out till the other interfaces are ready
	// var browserType = context.getUserAgent().getUserAgent();
	// if (browserType.match("iPhone")){
	//	sessionScope.put("browserType","iPhone");}
	// if (browserType.match("iPad")){
	//	sessionScope.put("browserType","iPad");}
	// if (browserType.match("Blackberry")){
	//	sessionScope.put("browserType","blackberry");}
	// if (browserType.match("Android")){
	//	sessionScope.put("browserType","Android");}
}

function checkTheme(browserName){
	if (browserName == "browser"){
		if (context.getSessionProperty("xsp.theme") != browserName + "_" + applicationScope.blogTheme){
			context.setSessionProperty("xsp.theme",browserName+ "_" + applicationScope.blogTheme);
			var thisPage = context.getUrl().getAddress();
			var thisPage = context.getUrl().toString();
			context.redirectToPage(thisPage);
		}
	}
}

function initSession(){
	// Quick Access To the Users Name.
	sessionScope.put("commonName",context.getUser().getCommonName());
	sessionScope.put("fullName",context.getUser().getFullName());
	
	// Quick Access To The Users Roles.
	sessionScope.put("showDebug",false);
	sessionScope.put("forumOwner",false);

	if(@Contains(context.getUser().getRoles(),"[DEBUG]") == @True()){
		sessionScope.put("showDebug",true);
	}
	if(@Contains(context.getUser().getRoles(),"[ForumOwner]") == @True()){
		sessionScope.put("forumOwner",true);
	}

	// Read or Setup User Profile
	var thisDB:NotesDatabase = sessionAsSigner.getDatabase(session.getServerName(),session.getCurrentDatabase().getFilePath());
	var userView:NotesView = thisDB.getView("lkp_UserProfiles");
	var userDoc:NotesDocument = userView.getDocumentByKey(sessionScope.commonName);
	if (userDoc == null){
		var userDoc:NotesDocument = thisDB.createDocument();
		userDoc.replaceItemValue("form","content_UserProfile");
		userDoc.replaceItemValue("user_Name",sessionScope.commonName);
		userDoc.replaceItemValue("user_UserName",sessionScope.commonName);
		var userDocAuthor:NotesItem = userDoc.getFirstItem("user_UserName");
		userDocAuthor.setAuthors(true);
		userDoc.replaceItemValue("user_Posts",0);
		userDoc.replaceItemValue("user_Replies",0);
		var curDate:NotesDateTime = session.createDateTime("Today");
		curDate.setNow();
		userDoc.replaceItemValue("user_LastDate",curDate);
		userDoc.replaceItemValue("user_JoinDate",curDate);
		userDoc.save();
		}

	sessionScope.userProfileUNID = userDoc.getUniversalID();

	sessionScope.put("init",true)
}

function initApplication(){
	// See if ExtendedAccess has been setup yet.
	var exDB:NotesDatabase = sessionAsSigner.getDatabase(session.getServerName(),session.getCurrentDatabase().getFilePath());
	var exView:NotesView = exDB.getView("lkp_ExtendedAccess");
	var exDoc:NotesDocument = exView.getFirstDocument();
	if (exDoc == null ){
		// No Extended Access Documents Exist So Create The Defaults.
		var ex1Doc:NotesDocument = exDB.createDocument();
		ex1Doc.replaceItemValue("form","fm_ExtendedAccess");
		ex1Doc.replaceItemValue("ex_Name","Everybody");
		ex1Doc.replaceItemValue("ex_Value","*");
		ex1Doc.save(true,true);
		var ex2Doc:NotesDocument = exDB.createDocument();
		ex2Doc.replaceItemValue("form","fm_ExtendedAccess");
		ex2Doc.replaceItemValue("ex_Name","Anonymous");
		ex2Doc.replaceItemValue("ex_Value","Anonymous");
		ex2Doc.save(true,true);
	}
	
	
	
	// Find The Active Blog Configuration Document.
	var configView:NotesView = database.getView("lkp_cfg_ActiveConfig");
	var configDoc:NotesDocument = configView.getFirstDocument();
	if (configDoc == null ){
		// Must be a new setup.
		// Build the initial Config Document.
		initialConfig();
		// Refresh The View.
		configView.refresh();
		// Open the new Config Document.
		var configDoc:NotesDocument = configView.getFirstDocument();
	}
	applicationScope.configUNID = configDoc.getUniversalID();
	// Basics
	applicationScope.forumName = configDoc.getItemValueString("cfg_Basic_ForumName");
	applicationScope.forumShortName = configDoc.getItemValueString("cfg_Basic_ForumShortName");
	applicationScope.blogFooter = configDoc.getItemValueString("cfg_basic_blogFooter");
	// Layout
	applicationScope.blogTheme = configDoc.getItemValueString("cfg_basic_blogTheme");
	// Login
	applicationScope.loginMarketTitle = configDoc.getItemValueString("cfg_login_market_title");
	applicationScope.loginMarketText = configDoc.getItemValueString("cfg_login_market_text");
	applicationScope.loginLegal1 = configDoc.getItemValueString("cfg_login_legal1");
	applicationScope.loginLegal2 = configDoc.getItemValueString("cfg_login_legal2");
	// Registration
	applicationScope.AppAllowReg = configDoc.getItemValueString("cfg_reg_enabled");
	applicationScope.AppRegDB = configDoc.getItemValueString("cfg_reg_directory");
	// Profiles
	applicationScope.AppProfileEdit = configDoc.getItemValueString("cfg_profiles_enabled");
	applicationScope.AppProfilePassword = configDoc.getItemValueString("cfg_profiles_passwordChange");
	
	applicationScope.put("init",true)
}

function initialConfig(){
	// Used For The First Time A Person Opens This Application.
	// Builds The Default Configuration.
	var thisDB:NotesDatabase = sessionAsSigner.getDatabase(session.getServerName(),session.getCurrentDatabase().getFilePath());
	var newConfigDoc:NotesDocument = thisDB.createDocument();
	newConfigDoc.replaceItemValue("Form","cfg_Config");
	// Basic
	newConfigDoc.replaceItemValue("cfg_Basic_ForumName","xTalk Forums");
	newConfigDoc.replaceItemValue("cfg_Basic_ForumShortName","xTalk Forums");
	newConfigDoc.replaceItemValue("cfg_basic_blogFooter","Powered By xTalk V1.1");
	// Layout
	newConfigDoc.replaceItemValue("cfg_basic_blogTheme","blue");
	// Login
	newConfigDoc.replaceItemValue("cfg_login_market_title","What Can You Do With xTalk?");
	newConfigDoc.replaceItemValue("cfg_login_market_text","xTalk : The multi-forum solution for IBM Lotus Domino.");
	newConfigDoc.replaceItemValue("cfg_login_legal1","Copyright Declan F Lynch");
	newConfigDoc.replaceItemValue("cfg_login_legal2","IBM, the IBM logo and Lotus are trademarks of IBM Corporation, in the United States, other countries, or both.");
	// Registration
	newConfigDoc.replaceItemValue("cfg_reg_enabled","false");
	newConfigDoc.replaceItemValue("cfg_reg_directory","");
	// Profiles
	newConfigDoc.replaceItemValue("cfg_profiles_enabled","false");
	newConfigDoc.replaceItemValue("cfg_profiles_passwordChange","false");
	
	newConfigDoc.save(true,true);
}

var Comments = (function() {
	return {
		getCommentCount: function(permaLink) {
			var commentCountKey = "comment_count_" + permaLink;
			if (!applicationScope.containsKey(commentCountKey)) {
				var comments = database.getView("lkp_Comments").getAllEntriesByKey(permaLink, true);
				applicationScope.put(commentCountKey, comments.getCount());
				}
			return applicationScope.get(commentCountKey)
		},
		incrementCommentCount: function(permaLink) {
			var commentCountKey = "comment_count_" + permaLink;
			if (applicationScope.containsKey(commentCountKey)) {
				applicationScope.put(commentCountKey, this.getCommentCount(permaLink) + 1);
			} else {
				applicationScope.put(commentCountKey, 1);
   			}
		},
		refreshCommentCount: function(permaLink) {
			var commentCountKey = "comment_count_" + permaLink;	
			var comments = database.getView("lkp_Comments").getAllEntriesByKey(permaLink, true);
			applicationScope.put(commentCountKey, comments.getCount());
		}
	};

}());

function @makeArray( object ){
 // from : http://dontpanic82.blogspot.com/
 if( typeof object === 'undefined' || object === null ){ return []; }
 if( typeof object.toArray !== 'undefined' ){
  return object.toArray();
 }
 if( object.constructor === Array ){ return object; }  
 return [ object ];
}