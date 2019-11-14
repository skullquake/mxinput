define(
	[
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dijit/_TemplatedMixin",
		"mxui/dom",
		"dojo/dom",
		"dojo/dom-prop",
		"dojo/dom-geometry",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/text",
		"dojo/html",
		"dojo/keys",
		"dojo/dom-attr",
		"dojo/_base/event",
		"mxinput/lib/jquery-1.11.2",
		"dojo/text!mxinput/widget/template/mxinput.html"
	],
	function(
		declare,
		_WidgetBase,
		_TemplatedMixin,
		dom,
		dojoDom,
		dojoProp,
		dojoGeometry,
		dojoClass,
		dojoStyle,
		dojoConstruct,
		dojoArray,
		dojoLang,
		dojoText,
		dojoHtml,
		dojoKeys,
		dojoAttr,
		dojoEvent,
		_jQuery,
		widgetTemplate
	){
		"use strict";
		var $=_jQuery.noConflict(true);
		return declare(
			"mxinput.widget.mxinput",
			[
				_WidgetBase,
				_TemplatedMixin
			],
			{
				templateString:widgetTemplate,
				inputBox:null,
				mfToExecute:"",
				progressBar:"",
				progressMsg:"",
				inputValue:"",
				async:"",
				placeholder:"",
				_contextObj:null,
				_alertDiv:null,
				_handles:null,
				constructor: function(){
					this._hanels=[];
				},
				postCreate:function(){
					this.connect(this.inputBox,"onkeydown",dojoLang.hitch(this,this.onEnterClick));				
					if(!this._isEmptyString(this.placeholder)){
						dojoAttr.set(this.inputBox,"placeholder",this.placeholder);
					}
				},
				update:function(obj,callback){
					this._contextObj=obj;
					this._resetSubscriptions();
					this._updateRendering(callback);
				},
				_updateRendering:function(callback){
					if(this._contextObj!==null){
						this.inputBox.value=this._contextObj.get(this.inputValue);
					}else{
						this.inputBox.value='';
					}
					this._executeCallback(callback,"_updateRendering");
				},
				uninitialize:function(){
				},
				onEnterClick:function(event) {
					this._contextObj.set(this.inputValue,this.inputBox.value);
					if(event.keyCode==dojoKeys.ENTER){
						if (this.mfToExecute!==""){  
							this.executeMicroflow(this.mfToExecute,this.async,this.progressBar);
						}
					}
				},
				_isEmptyString:function(str){
					return (!str||0===str.trim().length);
				},
				executeMicroflow:function(mf,async,showProgress){
					if(mf&&this._contextObj){
						if (showProgress) {
							var isModal=true;
							var pid=mx.ui.showProgress(this.progressMsg,isModal);
						}
						mx.data.action(
							{
								async:async,  
								 store:{
								   caller:this.mxform 
								},
								params: {
									actionname:mf,
									applyto:"selection",
									guids:[this._contextObj.getGuid()],
									
								},
								callback: function () {
									if (showProgress) {
									mx.ui.hideProgress(pid);
									}
								},
								error: function () {
									logger.error("mxinput.widget.mxinput.triggerMicroFlow: XAS error executing microflow");
									if (showProgress) {   
									mx.ui.hideProgress(pid);
									}
								}
							}
						);
					}
				},
				_executeCallback:function(cb,from){
					if(cb&&typeof cb==="function"){
						cb();
					}
				},
				_handleValidation:function(validations){
					this._clearValidations();
					var validation=validations[0];
					var message=validation.getReasonByAttribute(this.dataAttr);
					if(this.readOnly){
						validation.removeAttribute(this.dataAttr);
					}else if(message) {
						this._addValidation(message);
						validation.removeAttribute(this.dataAttr);
					}
				},
				_addValidation:function(message){
					this._showError(message);
				},
				_showError:function(msg){
					//unimplemented
				},
				_clearValidations: function () {
					dojoConstruct.destroy(this._alertDiv);
					this._alertDiv=null;
				},
				_resetSubscriptions: function () {
					if (this._handles) {
						this._handles.forEach(
							function(handle){
								mx.data.unsubscribe(handle);
							}
						);
						this._handles=[];
					}
					if(this._contextObj){
						var objectHandle=mx.data.subscribe(
							{
								guid:this._contextObj.getGuid(),
								callback:dojoLang.hitch(
									this,
									function(guid){
										this._updateRendering();
									}
								)
							}
						);
						var attrHandle=mx.data.subscribe(
							{
								guid:this._contextObj.getGuid(),
								attr:this.dataAttr,
								callback:dojoLang.hitch(
									this,
									function(guid,attr,attrValue) {
										this._updateRendering();
									}
								)
							}
						);
						var validationHandle=mx.data.subscribe({
							guid:this._contextObj.getGuid(),
							val:true,
							callback: dojoLang.hitch(this, this._handleValidation)
						});
						this._handles=[objectHandle,attrHandle,validationHandle];
					}
				}

			}
		);
	}
);
require(
	[
		"mxinput/widget/mxinput"
	],function(){
		"use strict ";
	}
);
