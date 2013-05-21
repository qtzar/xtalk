package com.xtalk.util;

import java.security.*;

public class HashMaster {
	public static String md5(String unhashed) {
		String hashed = "";
		byte[] defaultBytes = unhashed.getBytes();
		try {
			MessageDigest algorithm = MessageDigest.getInstance("MD5");
			algorithm.reset();
			algorithm.update(defaultBytes);
			byte messageDigest[] = algorithm.digest();

			StringBuffer hexString = new StringBuffer();
			for (int i = 0; i < messageDigest.length; i++) {
				String hex = Integer.toHexString(0xFF & messageDigest[i]); 
				if(hex.length()==1){
				hexString.append('0');
				}
				hexString.append(hex);
			}
			hashed = hexString.toString(); //messageDigest.toString();
		} catch (NoSuchAlgorithmException nsae) {

		}
		return hashed;
	}
}