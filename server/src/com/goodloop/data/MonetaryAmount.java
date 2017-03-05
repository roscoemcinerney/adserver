package com.goodloop.data;

import com.winterwell.utils.MathUtils;
import com.winterwell.utils.Printer;
import com.winterwell.utils.time.Time;

public final class MonetaryAmount extends Thing {
	private static final long serialVersionUID = 1L;

	MonetaryAmount() {	
	}
	
	public KCurrency currency = KCurrency.GBP;
	public long value100;
		
	/**
	 * 
	 * @param value100 The pence / cents. This is to avoid rounding errors.
	 */
	public MonetaryAmount(long value100) {
		this.value100 = value100;
	}


	public MonetaryAmount minus(MonetaryAmount x) {
		return new MonetaryAmount(getValue100() - x.getValue100());
	}


	public long getValue100() {
		return value100;
	}


	public double getValue() {
		return value100/100.0;
	}


	public static MonetaryAmount pound(double number) {
		return new MonetaryAmount((long) (number*100));
	}

	

	@Override
	public String toString() {
		return "MonetaryAmount[£" + Printer.prettyNumber(getValue()) + ", name=" + name + "]";
	}

}
