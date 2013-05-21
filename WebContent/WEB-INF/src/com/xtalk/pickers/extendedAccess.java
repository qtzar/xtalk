package com.xtalk.pickers;

import java.util.ArrayList;
import java.util.List;


import com.ibm.xsp.extlib.component.picker.data.IPickerEntry;
import com.ibm.xsp.extlib.component.picker.data.IPickerOptions;
import com.ibm.xsp.extlib.component.picker.data.IPickerResult;
import com.ibm.xsp.extlib.component.picker.data.INamePickerData;
import com.ibm.xsp.extlib.component.picker.data.SimplePickerResult;

public class extendedAccess implements INamePickerData {

	public extendedAccess() {
	}

	public String[] getSourceLabels() {
		String[] sourceLabel = {"Extended Access"};
		return sourceLabel;
	}
	
	public boolean hasCapability(int capability) {
		if(capability==CAPABILITY_EXTRAATTRIBUTES) {
			return true;
		}
		return false;
	}
	
	public List<IPickerEntry> loadEntries(Object[] ids, String[] attributes) {
		return null;
	}

	public IPickerResult readEntries(IPickerOptions options) {
		List<IPickerEntry> entries = new ArrayList<IPickerEntry>();
		entries.add(new SimplePickerResult.Entry("Everybody","*"));	
		entries.add(new SimplePickerResult.Entry("Anonymous","anonymous"));	
		return new SimplePickerResult(entries,-1);
	}
	
}
