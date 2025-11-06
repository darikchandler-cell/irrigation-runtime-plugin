# Regional Water Rates Reference Guide

**Last Updated:** January 2025  
**Source File:** `/utils/cumulativeStats.ts` (lines 164-178)  
**Next Review:** January 2026

---

## Current Water Rates (2024-2025)

### Rate Table

| Climate Zone | Rate/1000 gal | Cities | Population Density | Water Scarcity |
|--------------|---------------|--------|-------------------|----------------|
| Arid Desert | $8.50 | Phoenix, Las Vegas, Tucson | High | Very High |
| Mediterranean | $7.00 | Los Angeles, San Diego, San Francisco | Very High | High |
| Semi-Arid | $5.50 | Denver, Albuquerque, Boise | Medium | Medium |
| Humid Subtropical | $4.50 | Atlanta, Houston, Orlando, Dallas | High | Low |
| Humid Continental | $5.00 | Chicago, Boston, Minneapolis, NYC | Very High | Low |
| Pacific Northwest | $4.00 | Seattle, Portland, Eugene | Medium | Very Low |
| Mountain | $6.00 | Aspen, Park City, Flagstaff | Low | Medium |
| **National Average** | **$5.00** | **Default/Unknown** | - | - |

---

## Rate Justification & Sources

### Primary Data Sources
1. **Circle of Blue Water Pricing Report** (2024)
   - Annual survey of 50+ major US cities
   - https://www.circleofblue.org/waterpricingproject/

2. **AWWA (American Water Works Association) Rate Survey**
   - Industry standard for municipal water pricing
   - https://www.awwa.org/

3. **Municipal Utility Data**
   - Direct rates from city water departments
   - 2024-2025 rate schedules

### Regional Analysis

#### Arid Desert - $8.50
**Cities:** Phoenix, Las Vegas, Tucson, Palm Springs  
**Why High:**
- Severe water scarcity (Colorado River allocation issues)
- Expensive infrastructure for water importation
- Conservation pricing to discourage overuse
- Tiered pricing with high outdoor use rates

**Example Rates (2024):**
- Phoenix: $7.80-$9.50 per 1,000 gal (tiered)
- Las Vegas: $8.20-$10.00 per 1,000 gal
- Tucson: $7.50-$9.80 per 1,000 gal

**Our Rate:** $8.50 (conservative mid-range)

---

#### Mediterranean - $7.00
**Cities:** Los Angeles, San Diego, San Francisco, Sacramento  
**Why High:**
- Chronic drought conditions
- State-mandated conservation requirements
- High infrastructure costs
- Expensive imported water (State Water Project, Colorado River)

**Example Rates (2024):**
- Los Angeles: $6.50-$8.00 per 1,000 gal
- San Diego: $7.20-$9.50 per 1,000 gal
- San Francisco: $5.80-$7.50 per 1,000 gal

**Our Rate:** $7.00 (conservative, represents Los Angeles metro)

---

#### Semi-Arid - $5.50
**Cities:** Denver, Albuquerque, Boise, Salt Lake City  
**Why Moderate:**
- Moderate water availability (snowpack-dependent)
- Growing population pressure
- Climate change impacts on snowpack
- Infrastructure investment needed

**Example Rates (2024):**
- Denver: $5.00-$6.50 per 1,000 gal
- Albuquerque: $4.80-$6.20 per 1,000 gal
- Boise: $4.50-$5.80 per 1,000 gal

**Our Rate:** $5.50 (mid-range)

---

#### Humid Subtropical - $4.50
**Cities:** Atlanta, Houston, Orlando, Dallas, Charlotte  
**Why Low:**
- Abundant rainfall (40-60 inches/year)
- Lower scarcity = lower prices
- Less infrastructure for importation
- Occasional drought pricing adjustments

**Example Rates (2024):**
- Atlanta: $4.20-$5.50 per 1,000 gal
- Houston: $3.80-$5.00 per 1,000 gal
- Dallas: $4.50-$6.00 per 1,000 gal

**Our Rate:** $4.50 (represents typical Southeast pricing)

---

#### Humid Continental - $5.00
**Cities:** Chicago, Boston, New York, Minneapolis, Philadelphia  
**Why National Average:**
- Variable water availability
- High infrastructure costs (older cities)
- Dense population
- Adequate rainfall but aging systems

**Example Rates (2024):**
- Chicago: $4.50-$5.80 per 1,000 gal
- Boston: $5.50-$7.00 per 1,000 gal
- New York: $4.00-$5.50 per 1,000 gal

**Our Rate:** $5.00 (national average, used as default)

---

#### Pacific Northwest - $4.00
**Cities:** Seattle, Portland, Eugene, Tacoma  
**Why Low:**
- Abundant rainfall (30-50 inches/year)
- Plentiful water resources
- Hydroelectric infrastructure
- Lower treatment costs

**Example Rates (2024):**
- Seattle: $3.80-$5.00 per 1,000 gal
- Portland: $3.50-$4.50 per 1,000 gal
- Eugene: $3.20-$4.20 per 1,000 gal

**Our Rate:** $4.00 (represents abundant water regions)

---

#### Mountain - $6.00
**Cities:** Aspen, Park City, Flagstaff, Bend  
**Why Moderate-High:**
- High altitude infrastructure costs
- Tourist economy (high demand)
- Limited local sources
- Seasonal variation
- Small utility scale = higher per-unit costs

**Example Rates (2024):**
- Aspen: $6.50-$8.50 per 1,000 gal
- Park City: $5.50-$7.50 per 1,000 gal
- Flagstaff: $5.00-$6.50 per 1,000 gal

**Our Rate:** $6.00 (mid-range for mountain communities)

---

## How to Update Rates

### When to Update
- **Annually** (January) - Check for rate changes
- **Major Drought Events** - May trigger emergency pricing
- **New Data Release** - When Circle of Blue or AWWA publishes new data

### Where to Update
**File:** `/utils/cumulativeStats.ts`  
**Function:** `getRegionalWaterRate()`  
**Lines:** 164-178

### Update Process

1. **Research Current Rates**
   - Visit Circle of Blue: https://www.circleofblue.org/waterpricingproject/
   - Check AWWA survey data
   - Review major city utility websites

2. **Calculate New Rates**
   - Get rates from 3-5 major cities per climate zone
   - Average the rates
   - Use conservative (mid-range) values

3. **Update Code**
   ```typescript
   const regionalRates: Record<string, number> = {
     'arid-desert': 8.50,        // Update this value
     'mediterranean': 7.00,       // Update this value
     // ... etc
   };
   ```

4. **Update This Document**
   - Update "Last Updated" date
   - Update rate table
   - Update example rates
   - Document sources

5. **Update CHANGELOG.md**
   - Add entry: "Updated regional water rates based on 2025 data"

6. **Test Calculations**
   - Run example calculations
   - Verify savings estimates are reasonable
   - Check that rates make sense regionally

---

## Tiered Pricing Considerations

Many utilities use **tiered pricing** where higher usage = higher rates:

### Example: Los Angeles (2024)
- **Tier 1** (0-12 HCF): $5.90 per HCF
- **Tier 2** (13-42 HCF): $6.30 per HCF
- **Tier 3** (43+ HCF): $10.50 per HCF

*HCF = hundred cubic feet = 748 gallons*

### Our Approach
We use **mid-tier rates** assuming typical outdoor irrigation usage falls in Tier 2-3 during summer months. This is:
- Conservative (assumes higher usage tier)
- Realistic (outdoor irrigation is high-volume)
- Defensible (documented in disclaimers)

---

## Conversion Reference

### Volume Units
- 1 CCF (hundred cubic feet) = 748 gallons
- 1 HCF (hundred cubic feet) = 748 gallons
- 1 cubic meter = 264 gallons
- 1,000 gallons = 1.337 CCF

### Common Rate Formats
Some utilities price by:
- $/1,000 gallons (our format)
- $/CCF or $/HCF
- $/cubic meter
- $/gallon (rare)

**Always convert to $/1,000 gallons for consistency**

---

## Regional Notes

### California Drought Surcharges
California utilities may add temporary drought surcharges:
- Stage 1: +10-15%
- Stage 2: +20-30%
- Stage 3: +40-50%

**Our rates reflect "normal" conditions** - users in drought-declared areas will see higher actual bills.

### Seasonal Rates
Some utilities charge more in summer:
- Summer: Base rate × 1.2-1.5
- Winter: Base rate

**Our rates are annual averages** weighted toward summer outdoor use.

### Wastewater Exemptions
Outdoor water use typically doesn't incur wastewater charges:
- Indoor: Water + wastewater (often 2× cost)
- Outdoor: Water only

**Our rates reflect water-only charges** (appropriate for irrigation).

---

## Validation Checklist

Before updating rates, verify:

- [ ] Source data is from current year (within 12 months)
- [ ] Rates represent **outdoor tier** pricing (not indoor Tier 1)
- [ ] Multiple cities sampled per climate zone (minimum 3)
- [ ] Rates are in $/1,000 gallons (converted if needed)
- [ ] National average is reasonable ($4-6 range)
- [ ] Desert rates are highest (water scarcity)
- [ ] Pacific Northwest rates are lowest (water abundance)
- [ ] Changes are documented in CHANGELOG.md
- [ ] User disclaimers still accurate
- [ ] Example calculations still work

---

## Impact on Savings Calculations

### Example Calculation
**Zone:** 1,000 sq ft lawn, 3 days/week, 30 min/session  
**Water Use:** 1,400 gallons/week = 72,800 gallons/year  
**Savings:** 25% = 18,200 gallons/year

**Annual Savings by Zone:**
| Climate Zone | Rate | Annual Savings |
|--------------|------|----------------|
| Arid Desert | $8.50 | $154.70 |
| Mediterranean | $7.00 | $127.40 |
| Semi-Arid | $5.50 | $100.10 |
| Humid Subtropical | $4.50 | $81.90 |
| Humid Continental | $5.00 | $91.00 |
| Pacific Northwest | $4.00 | $72.80 |
| Mountain | $6.00 | $109.20 |

**Regional differences matter!** Phoenix users save 2× more than Seattle users.

---

## Future Considerations

### Potential Enhancements (v1.1+)
1. **User-Entered Rates** - Let users input their actual rate
2. **Tiered Calculation** - Model tiered pricing more accurately
3. **Seasonal Variation** - Separate summer/winter rates
4. **Drought Multipliers** - Adjust for drought declarations
5. **Wastewater Toggle** - Option to include/exclude wastewater
6. **Historical Tracking** - Show rate changes over time

### Data Quality Improvements
1. **More Cities** - Sample 5-10 cities per zone (currently 3-5)
2. **Quarterly Updates** - Check rates every 3 months
3. **API Integration** - Automate rate updates from utility APIs
4. **User Feedback** - Collect actual rate data from users

---

## References

### Primary Sources (Updated Annually)
- Circle of Blue Water Pricing Project: https://www.circleofblue.org/waterpricingproject/
- AWWA Water & Wastewater Rates Survey: https://www.awwa.org/
- EPA WaterSense: https://www.epa.gov/watersense

### Municipal Utility Websites (Examples)
- Phoenix Water: https://www.phoenix.gov/waterservices
- Los Angeles DWP: https://www.ladwp.com/
- Denver Water: https://www.denverwater.org/
- Atlanta Watershed: https://www.atlantawatershed.org/
- Chicago Water: https://www.chicago.gov/water
- Seattle Public Utilities: https://www.seattle.gov/utilities

### Industry Publications
- Journal AWWA (American Water Works Association)
- WaterWorld Magazine
- Water Finance & Management

---

## Contact for Updates

**Maintainer:** Vonareva  
**Last Review:** January 2025  
**Next Review:** January 2026  

---

*Keep this document updated annually to maintain calculation accuracy!*
