import { useState } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"

const COST_CENTERS = [
  {
    "code": "ECAFRNG",
    "name": "Partnership-Africa (E-Commerce)"
  },
  {
    "code": "ECWCANG",
    "name": "Partnership-WCA (E-Commerce)"
  },
  {
    "code": "EDAFRNG",
    "name": "EB Direct - Africa"
  },
  {
    "code": "EDEBDNG",
    "name": "Shared-EB Direct (Global)"
  },
  {
    "code": "EDNIGNG",
    "name": "EB Direct - Nigeria"
  },
  {
    "code": "EDNIGNG306",
    "name": "NG Area Abeokuta"
  },
  {
    "code": "EDNIGNG307",
    "name": "NG Area Abeokuta South"
  },
  {
    "code": "EDNIGNG308",
    "name": "NG Area Abuja"
  },
  {
    "code": "EDNIGNG309",
    "name": "NG Area Ado Ekiti"
  },
  {
    "code": "EDNIGNG310",
    "name": "NG Area Akinyele"
  },
  {
    "code": "EDNIGNG311",
    "name": "NG Area Akoko"
  },
  {
    "code": "EDNIGNG312",
    "name": "NG Area Akure"
  },
  {
    "code": "EDNIGNG313",
    "name": "NG Area Akure North"
  },
  {
    "code": "EDNIGNG314",
    "name": "NG Area Amuloko"
  },
  {
    "code": "EDNIGNG315",
    "name": "NG Area Anyigba"
  },
  {
    "code": "EDNIGNG316",
    "name": "NG Area Auchi"
  },
  {
    "code": "EDNIGNG317",
    "name": "NG Area Bauchi"
  },
  {
    "code": "EDNIGNG318",
    "name": "NG Area Benin"
  },
  {
    "code": "EDNIGNG319",
    "name": "NG Area Calabar"
  },
  {
    "code": "EDNIGNG320",
    "name": "NG Area Egbeda"
  },
  {
    "code": "EDNIGNG321",
    "name": "NG Area Epe"
  },
  {
    "code": "EDNIGNG322",
    "name": "NG Area Eruwa"
  },
  {
    "code": "EDNIGNG323",
    "name": "NG Area Gombe"
  },
  {
    "code": "EDNIGNG324",
    "name": "NG Area Gwagwalada"
  },
  {
    "code": "EDNIGNG325",
    "name": "NG Area Hadejia"
  },
  {
    "code": "EDNIGNG326",
    "name": "NG Area Ijebu Ode"
  },
  {
    "code": "EDNIGNG327",
    "name": "NG Area Ikire"
  },
  {
    "code": "EDNIGNG328",
    "name": "NG Area Ikole Ekiti"
  },
  {
    "code": "EDNIGNG329",
    "name": "NG Area Ikorodu"
  },
  {
    "code": "EDNIGNG330",
    "name": "NG Area Ikpoba Okha"
  },
  {
    "code": "EDNIGNG331",
    "name": "NG Area Ilaro"
  },
  {
    "code": "EDNIGNG332",
    "name": "NG Area Ile Ife"
  },
  {
    "code": "EDNIGNG333",
    "name": "NG Area Ilorin"
  },
  {
    "code": "EDNIGNG334",
    "name": "NG Area Iwo"
  },
  {
    "code": "EDNIGNG335",
    "name": "NG Area Kaduna"
  },
  {
    "code": "EDNIGNG336",
    "name": "NG Area Kano2"
  },
  {
    "code": "EDNIGNG337",
    "name": "NG Area Kebbi"
  },
  {
    "code": "EDNIGNG338",
    "name": "NG Area Moniya"
  },
  {
    "code": "EDNIGNG339",
    "name": "NG Area Offa"
  },
  {
    "code": "EDNIGNG340",
    "name": "NG Area Ogoja"
  },
  {
    "code": "EDNIGNG341",
    "name": "NG Area Okenne"
  },
  {
    "code": "EDNIGNG342",
    "name": "NG Area Okigwe"
  },
  {
    "code": "EDNIGNG343",
    "name": "NG Area Ondo"
  },
  {
    "code": "EDNIGNG344",
    "name": "NG Area Ore"
  },
  {
    "code": "EDNIGNG345",
    "name": "NG Area Osogbo"
  },
  {
    "code": "EDNIGNG346",
    "name": "NG Area Rukpokwu"
  },
  {
    "code": "EDNIGNG347",
    "name": "NG Area Sagamu"
  },
  {
    "code": "EDNIGNG348",
    "name": "NG Area Saki"
  },
  {
    "code": "EDNIGNG349",
    "name": "NG Area SaNG Areao"
  },
  {
    "code": "EDNIGNG350",
    "name": "NG Area Sokoto"
  },
  {
    "code": "EDNIGNG351",
    "name": "NG Area Uyo"
  },
  {
    "code": "EDNIGNG352",
    "name": "NG Area Warri"
  },
  {
    "code": "EDNIGNG353",
    "name": "NG Area Yenagoa"
  },
  {
    "code": "EDNIGNG354",
    "name": "NG Area Ikorodu North"
  },
  {
    "code": "EDNIGNG355",
    "name": "NG Area Akwanga"
  },
  {
    "code": "EDNIGNG356",
    "name": "NG Area Asaba"
  },
  {
    "code": "EDNIGNG357",
    "name": "NG Area Daura"
  },
  {
    "code": "EDNIGNGR01",
    "name": "NG Region East Central"
  },
  {
    "code": "EDNIGNGR02",
    "name": "NG Region South South"
  },
  {
    "code": "EDNIGNGR03",
    "name": "NG Region West East"
  },
  {
    "code": "EDNIGNGR04",
    "name": "NG Region North Central"
  },
  {
    "code": "EDNIGNGR05",
    "name": "NG Region North West"
  },
  {
    "code": "EDNIGNGR06",
    "name": "NG Region South West"
  },
  {
    "code": "EDNIGNGR07",
    "name": "NG Region West Central"
  },
  {
    "code": "EDNIGNGR08",
    "name": "NG Region West West"
  },
  {
    "code": "EDNIGNGZ01",
    "name": "NG Zone East"
  },
  {
    "code": "EDNIGNGZ02",
    "name": "NG Zone North"
  },
  {
    "code": "EDNIGNGZ03",
    "name": "NG Zone West"
  },
  {
    "code": "EOAFRNG",
    "name": "EB Direct Operations - Africa"
  },
  {
    "code": "EOEBDNG",
    "name": "Shared-EB Direct Operations (Global)"
  },
  {
    "code": "EONIGNG",
    "name": "EB Direct Operations - Nigeria"
  },
  {
    "code": "HQAFRNG",
    "name": "Shared-Africa (Partnership + EB Direct)"
  },
  {
    "code": "HQBANNG",
    "name": "Business Analytics HQ"
  },
  {
    "code": "HQCAFNG",
    "name": "Corporate Affairs HQ"
  },
  {
    "code": "HQCOMNG",
    "name": "Commercial HQ"
  },
  {
    "code": "HQCRKNG",
    "name": "Corporate Risk HQ"
  },
  {
    "code": "HQFINNG",
    "name": "Finance HQ"
  },
  {
    "code": "HQGLONG",
    "name": "Sales HQ"
  },
  {
    "code": "HQGLPNG",
    "name": "Greenlight HQ"
  },
  {
    "code": "HQHUMNG",
    "name": "HR & Administration HQ"
  },
  {
    "code": "HQKENNG",
    "name": "Shared-Kenya (Partnership + EB Direct)"
  },
  {
    "code": "HQMARNG",
    "name": "Marketing HQ"
  },
  {
    "code": "HQMOZNG",
    "name": "Shared-MOZ (Partnership + EB Direct)"
  },
  {
    "code": "HQNIGCWSC",
    "name": "Nigeria - CHW Service Center"
  },
  {
    "code": "HQNIGNG",
    "name": "Shared-Nigeria (Partnership + EB Direct)"
  },
  {
    "code": "HQNPSNG",
    "name": "New Product & Services HQ"
  },
  {
    "code": "HQOPENG",
    "name": "Operations HQ"
  },
  {
    "code": "HQRESNG",
    "name": "Research & Procurement HQ"
  },
  {
    "code": "HQTANNG",
    "name": "Shared-TAN (Partnership + EB Direct)"
  },
  {
    "code": "HQUGANG",
    "name": "Shared-Uganda (Partnership + EB Direct)"
  },
  {
    "code": "HQZAMNG",
    "name": "Shared-Zambia (Partnership + EB Direct)"
  },
  {
    "code": "PSAFRNG",
    "name": "Partnership-Africa (Partners)"
  },
  {
    "code": "PSWCANG",
    "name": "Partnership-WCA (Partners)"
  },
  {
    "code": "SHAFRNG",
    "name": "Partnership-Africa (Partner + E-Com)"
  },
  {
    "code": "SHSHPNG",
    "name": "Shared-Partnership (Global)"
  },
  {
    "code": "SHWCANG",
    "name": "Shared Partnership-WCA (Partner + E-Com)"
  },
  {
    "code": "ECAFRTG",
    "name": "Partnership-Africa (E-Commerce)"
  },
  {
    "code": "ECESATG",
    "name": "Partnership-ESA (E-Commerce)"
  },
  {
    "code": "ECROWTG",
    "name": "Partnership-ROW (E-Commerce)"
  },
  {
    "code": "EDAFRTG",
    "name": "EB Direct - Africa"
  },
  {
    "code": "EDEAFTG",
    "name": "EB Direct - East Africa"
  },
  {
    "code": "EDEBDTG",
    "name": "Shared-EB Direct (Global)"
  },
  {
    "code": "EDKENTG",
    "name": "EB Direct - Kenya"
  },
  {
    "code": "EDMALTG",
    "name": "EBD-Malawi"
  },
  {
    "code": "EDMOZTG",
    "name": "EB Direct - Mozambique"
  },
  {
    "code": "EDMYATG",
    "name": "EBD-Myanmar"
  },
  {
    "code": "EDNIGTG",
    "name": "EBD-Nigeria"
  },
  {
    "code": "EDTAN",
    "name": "EB Direct - Tanzania"
  },
  {
    "code": "EDTOGTG",
    "name": "EBD-Togo"
  },
  {
    "code": "EDTOGTGCLC",
    "name": "EBD-Togo (Call Center)"
  },
  {
    "code": "EDUGATG",
    "name": "EB Direct - Uganda"
  },
  {
    "code": "EDZAMTG",
    "name": "EB Direct - Zambia"
  },
  {
    "code": "EDZANTG",
    "name": "EBD-Zanzibar"
  },
  {
    "code": "EOAFRTG",
    "name": "EB Direct Operations - Africa"
  },
  {
    "code": "EOEAFTG",
    "name": "EB Direct Operations - East Africa"
  },
  {
    "code": "EOEBDTG",
    "name": "Shared-EB Direct Operations (Global)"
  },
  {
    "code": "EOKENTG",
    "name": "EB Direct Operations - Kenya"
  },
  {
    "code": "EOMALTG",
    "name": "EB Direct Operations - Malawi"
  },
  {
    "code": "EOMOZTG",
    "name": "EB Direct Operations - Mozambique"
  },
  {
    "code": "EOMYATG",
    "name": "EB Direct Operations - Myanmar"
  },
  {
    "code": "EONIGTG",
    "name": "EB Direct Operations - Nigeria"
  },
  {
    "code": "EOTANTG",
    "name": "EB Direct Operations - Tanzania"
  },
  {
    "code": "EOTOGTG",
    "name": "EB Direct Operations - Togo"
  },
  {
    "code": "EOUGATG",
    "name": "EB Direct Operations - Uganda"
  },
  {
    "code": "EOZAMTG",
    "name": "EB Direct Operations - Zambia"
  },
  {
    "code": "EOZANTG",
    "name": "EB Direct Operations - Zanzibar"
  },
  {
    "code": "HQAFRTG",
    "name": "Shared-Africa (Partnership + EB Direct)"
  },
  {
    "code": "HQBANTG",
    "name": "Business Analytics HQ"
  },
  {
    "code": "HQCAFTG",
    "name": "Corporate Affairs HQ"
  },
  {
    "code": "HQCOMTG",
    "name": "Commercial HQ"
  },
  {
    "code": "HQCRKTG",
    "name": "Corporate Risk HQ"
  },
  {
    "code": "HQEDOTG",
    "name": "Easybuy Direct Operations HQ"
  },
  {
    "code": "HQFINTG",
    "name": "Finance HQ"
  },
  {
    "code": "HQGLOTG",
    "name": "Sales HQ"
  },
  {
    "code": "HQGLPTG",
    "name": "Greenlight HQ"
  },
  {
    "code": "HQHUMTG",
    "name": "HR & Administration HQ"
  },
  {
    "code": "HQKENTG",
    "name": "Shared-Kenya (Partnership + EB Direct)"
  },
  {
    "code": "HQMALTG",
    "name": "Shared-Malawi (Partnership + EB Direct)"
  },
  {
    "code": "HQMARTG",
    "name": "Marketing HQ"
  },
  {
    "code": "HQMARTGLG",
    "name": "Marketing HQ - New logo change"
  },
  {
    "code": "HQMOZTG",
    "name": "Shared-Mozambique (Partnership + EB Dire"
  },
  {
    "code": "HQMYATG",
    "name": "Shared-Myanmar (Partnership + EB Direct)"
  },
  {
    "code": "HQNIGTG",
    "name": "Shared-Nigeria (Partnership + EB Direct)"
  },
  {
    "code": "HQNPSTG",
    "name": "New Product & Services HQ"
  },
  {
    "code": "HQOPETG",
    "name": "Operations HQ"
  },
  {
    "code": "HQRESTG",
    "name": "Research & Procurement HQ"
  },
  {
    "code": "HQTANTG",
    "name": "Shared-Tanzania (Partnership + EB Direct"
  },
  {
    "code": "HQTOGTG",
    "name": "Shared-Togo (Partnership + EB Direct)"
  },
  {
    "code": "HQUGATG",
    "name": "Shared-Uganda (Partnership + EB Direct)"
  },
  {
    "code": "HQZAMTG",
    "name": "Shared-Zambia (Partnership + EB Direct)"
  },
  {
    "code": "HQZANTG",
    "name": "Shared-Zanzibar (Partnership + EB Direct"
  },
  {
    "code": "PSAFRTG",
    "name": "Partnership-Africa (Partners)"
  },
  {
    "code": "PSESATG",
    "name": "Partnership-ESA (Partners)"
  },
  {
    "code": "PSROWTG",
    "name": "Partnership-ROW (Partners)"
  },
  {
    "code": "PSWCATG",
    "name": "Partnership-WCA (Partners)"
  },
  {
    "code": "SHAFRTG",
    "name": "Partnership-Africa (Partner + E-Com)"
  },
  {
    "code": "SHESATG",
    "name": "Shared Partnership-ESA (Partner + E-Com)"
  },
  {
    "code": "SHROWTG",
    "name": "Shared Partnership-ROW (Partner + E-Com)"
  },
  {
    "code": "SHSHPTG",
    "name": "Shared-Partnership (Global)"
  },
  {
    "code": "SHWCATG",
    "name": "Shared Partnership-WCA (Partner + E-Com)"
  },
  {
    "code": "PSEAFTG",
    "name": "Partnership-East Africa (Partners)"
  },
  {
    "code": "ECEAFTG",
    "name": "Partnership-East Africa (E-Commerce)"
  },
  {
    "code": "SHEAFTG",
    "name": "Shared Partnership-East Africa (Partner)"
  },
  {
    "code": "PSSAFTG",
    "name": "Partnership-Southern Africa (Partners)"
  },
  {
    "code": "ECSAFTG",
    "name": "Partnership-Southern Africa (E-Commerce)"
  },
  {
    "code": "SHSAFTG",
    "name": "Shared Partnership-Southern Africa (Partner + E-Com)"
  },
  {
    "code": "ECAFRCM",
    "name": "Partnership-Africa (E-Commerce)"
  },
  {
    "code": "ECESACM",
    "name": "Partnership-ESA (E-Commerce)"
  },
  {
    "code": "ECROWCM",
    "name": "Partnership-ROW (E-Commerce)"
  },
  {
    "code": "EDAFRCM",
    "name": "EB Direct - Africa"
  },
  {
    "code": "EDCAMCM",
    "name": "EBD-Cameroon"
  },
  {
    "code": "EDCAMCMCLC",
    "name": "EBD-Cameroon (Call Center)"
  },
  {
    "code": "EDEAFCM",
    "name": "EB Direct - East Africa"
  },
  {
    "code": "EDEBDCM",
    "name": "Shared-EB Direct (Global)"
  },
  {
    "code": "EDKENCM",
    "name": "EB Direct - Kenya"
  },
  {
    "code": "EDMALCM",
    "name": "EBD-Malawi"
  },
  {
    "code": "EDMOZCM",
    "name": "EB Direct - Mozambique"
  },
  {
    "code": "EDMYACM",
    "name": "EBD-Myanmar"
  },
  {
    "code": "EDNIGCM",
    "name": "EBD-Nigeria"
  },
  {
    "code": "EDTANCM",
    "name": "EB Direct - Tanzania"
  },
  {
    "code": "EDTOGCM",
    "name": "EBD-Myanmar"
  },
  {
    "code": "EDUGACM",
    "name": "EB Direct - Uganda"
  },
  {
    "code": "EDZAMCM",
    "name": "EB Direct - Zambia"
  },
  {
    "code": "EDZANCM",
    "name": "EBD-Zanzibar"
  },
  {
    "code": "EOAFRCM",
    "name": "EB Direct Operations - Africa"
  },
  {
    "code": "EOCAMCM",
    "name": "EB Direct Operations - Cameroon"
  },
  {
    "code": "EOEAFCM",
    "name": "EB Direct Operations - East Africa"
  },
  {
    "code": "EOEBDCM",
    "name": "Shared-EB Direct Operations (Global)"
  },
  {
    "code": "EOKENCM",
    "name": "EB Direct Operations - Kenya"
  },
  {
    "code": "EOMALCM",
    "name": "EB Direct Operations - Malawi"
  },
  {
    "code": "EOMOZCM",
    "name": "EB Direct Operations - Mozambique"
  },
  {
    "code": "EOMYACM",
    "name": "EB Direct Operations - Myanmar"
  },
  {
    "code": "EONIGCM",
    "name": "EB Direct Operations - Nigeria"
  },
  {
    "code": "EOTANCM",
    "name": "EB Direct Operations - Tanzania"
  },
  {
    "code": "EOTOGCM",
    "name": "EB Direct Operations - Togo"
  },
  {
    "code": "EOUGACM",
    "name": "EB Direct Operations - Uganda"
  },
  {
    "code": "EOZAMCM",
    "name": "EB Direct Operations - Zambia"
  },
  {
    "code": "EOZANCM",
    "name": "EB Direct Operations - Zanzibar"
  },
  {
    "code": "HQAFRCM",
    "name": "Shared-Africa (Partnership + EB Direct)"
  },
  {
    "code": "HQBANCM",
    "name": "Business Analytics HQ"
  },
  {
    "code": "HQCAFCM",
    "name": "Corporate Affairs HQ"
  },
  {
    "code": "HQCAMCM",
    "name": "Shared-Cameroon (Partnership + EB Direct"
  },
  {
    "code": "HQCOMCM",
    "name": "Commercial HQ"
  },
  {
    "code": "HQCRKCM",
    "name": "Corporate Risk HQ"
  },
  {
    "code": "HQEDOCM",
    "name": "Easybuy Direct Operations HQ"
  },
  {
    "code": "HQFINCM",
    "name": "Finance HQ"
  },
  {
    "code": "HQGLOCM",
    "name": "Sales HQ"
  },
  {
    "code": "HQGLPCM",
    "name": "Greenlight HQ"
  },
  {
    "code": "HQHUMCM",
    "name": "HR & Administration HQ"
  },
  {
    "code": "HQKENCM",
    "name": "Shared-Kenya (Partnership + EB Direct)"
  },
  {
    "code": "HQMALCM",
    "name": "Shared-Malawi (Partnership + EB Direct)"
  },
  {
    "code": "HQMARCM",
    "name": "Marketing HQ"
  },
  {
    "code": "HQMARCMLG",
    "name": "Marketing HQ - New Logo"
  },
  {
    "code": "HQMOZCM",
    "name": "Shared-Mozambique (Partnership + EB Dire"
  },
  {
    "code": "HQMYACM",
    "name": "Shared-Myanmar (Partnership + EB Direct)"
  },
  {
    "code": "HQNIGCM",
    "name": "Shared-Nigeria (Partnership + EB Direct)"
  },
  {
    "code": "HQNPSCM",
    "name": "New Product & Services HQ"
  },
  {
    "code": "HQOPECM",
    "name": "Operations HQ"
  },
  {
    "code": "HQRESCM",
    "name": "Research & Procurement HQ"
  },
  {
    "code": "HQTANCM",
    "name": "Shared-Tanzania (Partnership + EB Direct"
  },
  {
    "code": "HQTOGCM",
    "name": "Shared-Togo (Partnership + EB Direct)"
  },
  {
    "code": "HQUGACM",
    "name": "Shared-Uganda (Partnership + EB Direct)"
  },
  {
    "code": "HQZAMCM",
    "name": "Shared-Zambia (Partnership + EB Direct)"
  },
  {
    "code": "HQZANCM",
    "name": "Shared-Zanzibar (Partnership + EB Direct"
  },
  {
    "code": "PSAFRCM",
    "name": "Partnership-Africa (Partners)"
  },
  {
    "code": "PSESACM",
    "name": "Partnership-ESA (Partners)"
  },
  {
    "code": "PSROWCM",
    "name": "Partnership-ROW (Partners)"
  },
  {
    "code": "PSWCACM",
    "name": "Partnership-WCA (Partners)"
  },
  {
    "code": "SHAFRCM",
    "name": "Partnership-Africa (Partner + E-Com)"
  },
  {
    "code": "SHESACM",
    "name": "Shared Partnership-ESA (Partner + E-Com)"
  },
  {
    "code": "SHROWCM",
    "name": "Shared Partnership-ROW (Partner + E-Com)"
  },
  {
    "code": "SHSHPCM",
    "name": "Shared-Partnership (Global)"
  },
  {
    "code": "SHWCACM",
    "name": "Shared Partnership-WCA (Partner + E-Com)"
  },
  {
    "code": "PSEAFCM",
    "name": "Partnership-East Africa (Partners)"
  },
  {
    "code": "ECEAFCM",
    "name": "Partnership-East Africa (E-Commerce)"
  },
  {
    "code": "SHEAFCM",
    "name": "Shared Partnership-East Africa (Partner)"
  },
  {
    "code": "PSSAFCM",
    "name": "Partnership-Southern Africa (Partners)"
  },
  {
    "code": "ECSAFCM",
    "name": "Partnership-Southern Africa (E-Commerce)"
  },
  {
    "code": "SHSAFCM",
    "name": "Shared Partnership-Southern Africa (Partner + E-Com)"
  }
]

const VENDORS = [
  {
    "code": "200005",
    "name": "Balance Converted To Pref Shares"
  },
  {
    "code": "200007",
    "name": "Bestway Industrial (Hk) Limited"
  },
  {
    "code": "200009",
    "name": "Bolnik Technologies Limited"
  },
  {
    "code": "200010",
    "name": "Bon Almonde"
  },
  {
    "code": "200011",
    "name": "Burn Manufacturing Usa Llc"
  },
  {
    "code": "200015",
    "name": "Cttech Co., Ltd -Topwise"
  },
  {
    "code": "200017",
    "name": "Dong Guan Legion Electronic Tech. L"
  },
  {
    "code": "200022",
    "name": "Dummy Vendor"
  },
  {
    "code": "200034",
    "name": "Hockyn Limited"
  },
  {
    "code": "200039",
    "name": "Ict Cart Limited"
  },
  {
    "code": "200055",
    "name": "Opes Solutions Limited"
  },
  {
    "code": "200070",
    "name": "Shenzhen Glotronics Technology Co L"
  },
  {
    "code": "200075",
    "name": "Shenzhen Ktc Technology Co., Ltd"
  },
  {
    "code": "200077",
    "name": "Shenzhen Ningzexin Solar Electricit"
  },
  {
    "code": "200080",
    "name": "Shenzhen Yucheng Technology Co., Lt"
  },
  {
    "code": "200082",
    "name": "Soonreach Technology Ltd / Huizhou"
  },
  {
    "code": "200083",
    "name": "Srne Solar Co.,Ltd -Material"
  },
  {
    "code": "200084",
    "name": "Startimes"
  },
  {
    "code": "200090",
    "name": "Total Nigeria Plc"
  },
  {
    "code": "200092",
    "name": "Trexona Global Services"
  },
  {
    "code": "200100",
    "name": "Jiangmen Nostop Electric Co., Ltd"
  },
  {
    "code": "200101",
    "name": "Shenzhen Ecosolar Technology Co.,Lt"
  },
  {
    "code": "200102",
    "name": "Shenzhen Shuori New Energy Tech"
  },
  {
    "code": "200115",
    "name": "Shenzhen Glotronics Technology Co.,"
  },
  {
    "code": "200122",
    "name": "Chinese Vendor Freight And Sgs Git"
  },
  {
    "code": "200123",
    "name": "Fgn Duty"
  },
  {
    "code": "200124",
    "name": "Goods In Transit"
  },
  {
    "code": "200175",
    "name": "Shenzhen Ecosolar Technology Co.,Lt"
  },
  {
    "code": "200181",
    "name": "Dongguan Hierq Electronics Co"
  },
  {
    "code": "200182",
    "name": "Shenzhen Ani Technology Co.Ltd"
  },
  {
    "code": "200185",
    "name": "Guangdong Jy Solar Technology Co.,"
  },
  {
    "code": "200189",
    "name": "Xiamen Trip Solar Technology Co. Lt"
  },
  {
    "code": "200190",
    "name": "Aflabid Tech"
  },
  {
    "code": "200191",
    "name": "Benefit Solar And Satellite Service"
  },
  {
    "code": "200192",
    "name": "Green Twist Ventures"
  },
  {
    "code": "200193",
    "name": "Saquest Solar Technology"
  },
  {
    "code": "200194",
    "name": "God'S Grace Logistics"
  },
  {
    "code": "200195",
    "name": "Nahco Logistics Services Limited"
  },
  {
    "code": "200196",
    "name": "Sure Carrier Ltd"
  },
  {
    "code": "200197",
    "name": "Jinzhou Yangguang Energy Co.,Ltd."
  },
  {
    "code": "200204",
    "name": "Shenzhen Shuori New Energy Technolo"
  },
  {
    "code": "200207",
    "name": "In&Out(Gd) New Energy Technology Lt"
  },
  {
    "code": "200211",
    "name": "Godrej & Boyce Mfg Co Ltd"
  },
  {
    "code": "200219",
    "name": "Dongguan Royqueen Technology Co., L"
  },
  {
    "code": "200221",
    "name": "Srne Solar Co,Ltd"
  },
  {
    "code": "200229",
    "name": "Guangdong Jinyuan Solar Energy Co,L"
  },
  {
    "code": "200233",
    "name": "Shenzhen Anxin"
  },
  {
    "code": "200240",
    "name": "Francis Abasilim"
  },
  {
    "code": "200241",
    "name": "Ayoola Babalola"
  },
  {
    "code": "200242",
    "name": "Veevee Paper Products Limited"
  },
  {
    "code": "200243",
    "name": "Pizzon Pacakaging"
  },
  {
    "code": "200244",
    "name": "Alfim Nigeria Ltd"
  },
  {
    "code": "200245",
    "name": "Eternal Asia Supply Chain Managemen"
  },
  {
    "code": "200246",
    "name": "Everything Debolala Enterprise"
  },
  {
    "code": "200247",
    "name": "Hierq Enterprises Limited (Cost Dif"
  },
  {
    "code": "200248",
    "name": "R&A Power Electronic Equipment (She"
  },
  {
    "code": "200256",
    "name": "Greenway Technolog Co.Ltd"
  },
  {
    "code": "200263",
    "name": "Huizhou Mingdian Energy Technology"
  },
  {
    "code": "200268",
    "name": "Cotecna Inspection (China) Ltd."
  },
  {
    "code": "200272",
    "name": "Greenway Power Limited"
  },
  {
    "code": "200274",
    "name": "Shenzhen Topray Solar Co.,Ltd."
  },
  {
    "code": "200275",
    "name": "Shenzhen Xiezhen New Energy Co.,Ltd"
  },
  {
    "code": "200277",
    "name": "Guangdong Greenway Technology Co.,"
  },
  {
    "code": "200280",
    "name": "Shenzhen Lux Power Technology Co,Lt"
  },
  {
    "code": "200288",
    "name": "Sonatel Sa"
  },
  {
    "code": "200297",
    "name": "Y.C.N Trading Co.Ltd.Gz"
  },
  {
    "code": "200301",
    "name": "Shenzhen Desun Energy Technology Co"
  },
  {
    "code": "200303",
    "name": "Hong Kong Long Power Industry Inves"
  },
  {
    "code": "200304",
    "name": "Guangdong Cinotex Environmental Pro"
  },
  {
    "code": "200305",
    "name": "Huizhou Bestzone Electronics Co.Ltd"
  },
  {
    "code": "200306",
    "name": "Hongkong Shunyilong Trading Limited"
  },
  {
    "code": "300004",
    "name": "9Mobile Emerging Markets Telecomm S"
  },
  {
    "code": "300021",
    "name": "Abosede Omoboja Tifase"
  },
  {
    "code": "300022",
    "name": "Abubakar Molid"
  },
  {
    "code": "300031",
    "name": "Activation Plus Enterprises"
  },
  {
    "code": "300038",
    "name": "Adeoti Olawale Joseph"
  },
  {
    "code": "300039",
    "name": "Adesuwa Osawe Iyamu"
  },
  {
    "code": "300041",
    "name": "Adgenda Media Limited"
  },
  {
    "code": "300050",
    "name": "Afee Computers"
  },
  {
    "code": "300051",
    "name": "Afi Furniture Industries Ltd"
  },
  {
    "code": "300056",
    "name": "Africa'S Talking Ltd"
  },
  {
    "code": "300066",
    "name": "Agenda Pharmacare Ltd"
  },
  {
    "code": "300067",
    "name": "Aghayedo Brothers Enterprises"
  },
  {
    "code": "300073",
    "name": "Aiico Insurance Plc"
  },
  {
    "code": "300080",
    "name": "Airtel Nigeria Limited"
  },
  {
    "code": "300106",
    "name": "All Round Cleaning Services"
  },
  {
    "code": "300110",
    "name": "Alpha Crest Ascension"
  },
  {
    "code": "300111",
    "name": "Alpha Technologies Ltd"
  },
  {
    "code": "300114",
    "name": "Alton Peak"
  },
  {
    "code": "300128",
    "name": "A-Mobile Ltd"
  },
  {
    "code": "300129",
    "name": "Amore-G Nigeria Limited"
  },
  {
    "code": "300131",
    "name": "Andersen Tax"
  },
  {
    "code": "300132",
    "name": "Andersen Tax - Salary Account"
  },
  {
    "code": "300205",
    "name": "Axa Mansard Health Limited"
  },
  {
    "code": "300211",
    "name": "Babs Awobo Enterprise"
  },
  {
    "code": "300212",
    "name": "Babsun Tech"
  },
  {
    "code": "300215",
    "name": "Bakare Bashiru"
  },
  {
    "code": "300216",
    "name": "Bakyu Isah Yusuf"
  },
  {
    "code": "300232",
    "name": "Bellwether Solicitors"
  },
  {
    "code": "300233",
    "name": "Bemofat-Links Technical Consult"
  },
  {
    "code": "300278",
    "name": "Blizzspring Hospitality Ltd"
  },
  {
    "code": "300291",
    "name": "Tiloc Nigeria Ltd"
  },
  {
    "code": "300292",
    "name": "Bon Voyagetravel"
  },
  {
    "code": "300300",
    "name": "Brand Physio Nig Ltd"
  },
  {
    "code": "300324",
    "name": "C & I Basic Ventures"
  },
  {
    "code": "300327",
    "name": "C&I Basic Ventures"
  },
  {
    "code": "300345",
    "name": "Carlcare Development Nigeria Limite"
  },
  {
    "code": "300347",
    "name": "Carnely Funds"
  },
  {
    "code": "300372",
    "name": "Chert Systems Solution"
  },
  {
    "code": "300377",
    "name": "Chinese Vendor Freight And Sgs Git"
  },
  {
    "code": "300397",
    "name": "Cipm Nigeria"
  },
  {
    "code": "300425",
    "name": "Coloured Spaces Nig Ltd"
  },
  {
    "code": "300429",
    "name": "Compovine Technologies Ltd"
  },
  {
    "code": "300432",
    "name": "Concepthouse Blue Limited"
  },
  {
    "code": "300439",
    "name": "Consumable Product And Services Lim"
  },
  {
    "code": "300444",
    "name": "Core Execution Limited"
  },
  {
    "code": "300497",
    "name": "Courierplus Services Limited"
  },
  {
    "code": "300504",
    "name": "Crc Credit Bureau Limited"
  },
  {
    "code": "300511",
    "name": "Crisppearl Ltd"
  },
  {
    "code": "300516",
    "name": "Ctru Concepts"
  },
  {
    "code": "300521",
    "name": "Dahabshiil Trading Company"
  },
  {
    "code": "300532",
    "name": "Datasek Systems"
  },
  {
    "code": "300548",
    "name": "Deloitte-Glp Sunking Nigeria Limite"
  },
  {
    "code": "300551",
    "name": "Demil - Ash Ventures"
  },
  {
    "code": "300561",
    "name": "Desire Printing House"
  },
  {
    "code": "300564",
    "name": "De-Vertican Concerns Ltd"
  },
  {
    "code": "300572",
    "name": "Dhl International Ngn"
  },
  {
    "code": "300582",
    "name": "Digital Offset"
  },
  {
    "code": "300624",
    "name": "Drishti Soft Solutions Pvt Ltd"
  },
  {
    "code": "300635",
    "name": "Easy Buy Paga Account"
  },
  {
    "code": "300654",
    "name": "Egbuniwe Ifeanyi Chris"
  },
  {
    "code": "300677",
    "name": "Elysian Creations Limited"
  },
  {
    "code": "300684",
    "name": "Emperorville Global Ventures Ltd"
  },
  {
    "code": "300728",
    "name": "Euclide Concept International"
  },
  {
    "code": "300754",
    "name": "Fafure Mojisola"
  },
  {
    "code": "300755",
    "name": "Fagbohun Babajide Segun"
  },
  {
    "code": "300757",
    "name": "Falcon Courier Charges"
  },
  {
    "code": "300763",
    "name": "Fed Ex Nigeria"
  },
  {
    "code": "300768",
    "name": "Fgn Duty"
  },
  {
    "code": "300769",
    "name": "Fidelity Homes & Co"
  },
  {
    "code": "300784",
    "name": "Flotus Venture Ltd"
  },
  {
    "code": "300790",
    "name": "Fouani Nigeria Ltd"
  },
  {
    "code": "300856",
    "name": "Globacom Business Solution"
  },
  {
    "code": "300859",
    "name": "Global Property & Facilities Intl."
  },
  {
    "code": "300869",
    "name": "Goods In Transit"
  },
  {
    "code": "300881",
    "name": "Grant Thornton - Ng"
  },
  {
    "code": "300890",
    "name": "Great Place To Work Nig Ltd"
  },
  {
    "code": "300899",
    "name": "Grooming Mfb"
  },
  {
    "code": "300906",
    "name": "Gwx Logistics"
  },
  {
    "code": "300914",
    "name": "Halogen Security Company Limited"
  },
  {
    "code": "300935",
    "name": "Hexon Environmental Consultants"
  },
  {
    "code": "300945",
    "name": "Hinckley Group"
  },
  {
    "code": "300993",
    "name": "Idec Surcharge"
  },
  {
    "code": "300996",
    "name": "Iheanacho Chidiebere"
  },
  {
    "code": "301000",
    "name": "Iliyasu Yau Kebberi"
  },
  {
    "code": "301033",
    "name": "Interest Payable-Isbd"
  },
  {
    "code": "301042",
    "name": "Io Filmworks"
  },
  {
    "code": "301047",
    "name": "Is Internet Solutions Ltd (Unimax)"
  },
  {
    "code": "301051",
    "name": "Isiaka Bakare"
  },
  {
    "code": "301089",
    "name": "Job Boxx Nigeria Limited"
  },
  {
    "code": "301104",
    "name": "Js Treasure Ventures"
  },
  {
    "code": "301114",
    "name": "Justice Unagha"
  },
  {
    "code": "301164",
    "name": "Khaliph Brand Protection Services L"
  },
  {
    "code": "301181",
    "name": "Kings Court Limited"
  },
  {
    "code": "301200",
    "name": "Kolade Ilesanmi & Associates"
  },
  {
    "code": "301204",
    "name": "Konga Online Shop"
  },
  {
    "code": "301212",
    "name": "Kpmg Advisory Services - Ng"
  },
  {
    "code": "301244",
    "name": "Lapo Mfb Liab"
  },
  {
    "code": "301246",
    "name": "Latak Resources Nig Ltd"
  },
  {
    "code": "301258",
    "name": "Leotona & Carolina"
  },
  {
    "code": "301288",
    "name": "Logistiq Xpeditors Limited -Lx Glob"
  },
  {
    "code": "301289",
    "name": "Lola Bolarinwa And Company"
  },
  {
    "code": "301308",
    "name": "Lx Global Concepts Limited -(Wareho"
  },
  {
    "code": "301326",
    "name": "Madison And Park"
  },
  {
    "code": "301333",
    "name": "Mai Properties"
  },
  {
    "code": "301335",
    "name": "Main One Cable Company Nig Ltd"
  },
  {
    "code": "301336",
    "name": "Majh International Company"
  },
  {
    "code": "301346",
    "name": "Mama Sunday Kitchen (Native Caterin"
  },
  {
    "code": "301349",
    "name": "Maneuver Logistics"
  },
  {
    "code": "301383",
    "name": "Mavideck Global Enterprises"
  },
  {
    "code": "301431",
    "name": "Mkj Nig Ltd"
  },
  {
    "code": "301438",
    "name": "Mochenz Computers"
  },
  {
    "code": "301468",
    "name": "Mtn Nigeria"
  },
  {
    "code": "301476",
    "name": "Mukaila Oladimeji Ajikson"
  },
  {
    "code": "301539",
    "name": "Nianto Garments Limited"
  },
  {
    "code": "301544",
    "name": "Nigeria Energy Forum"
  },
  {
    "code": "301568",
    "name": "Nuddie Personalized Outfits"
  },
  {
    "code": "301569",
    "name": "Nura Adodo Yusuf"
  },
  {
    "code": "301576",
    "name": "Oare Akhabue Marcus"
  },
  {
    "code": "301578",
    "name": "Occupational Health And Safety Mana"
  },
  {
    "code": "301586",
    "name": "Ogunbowale Isola"
  },
  {
    "code": "301590",
    "name": "Olabanji Jamie"
  },
  {
    "code": "301595",
    "name": "Oloruntomi Olorunfemi"
  },
  {
    "code": "301597",
    "name": "Oluwadamilola Apenna"
  },
  {
    "code": "301599",
    "name": "Omaas Trading Limited"
  },
  {
    "code": "301620",
    "name": "Ovene Atta"
  },
  {
    "code": "301628",
    "name": "Paddy Cover Limited"
  },
  {
    "code": "301643",
    "name": "Panoply Magazine Ent"
  },
  {
    "code": "301687",
    "name": "Pinovn Nominees Limited"
  },
  {
    "code": "301690",
    "name": "Pivotage Consulting Ltd"
  },
  {
    "code": "301702",
    "name": "Potters Print Communication"
  },
  {
    "code": "301738",
    "name": "Protea Hotel - Ng"
  },
  {
    "code": "301767",
    "name": "Avalon Intercontinent Ltd(Radisson"
  },
  {
    "code": "301795",
    "name": "Rayto Logistics Limited"
  },
  {
    "code": "301796",
    "name": "Re' Uzo Company"
  },
  {
    "code": "301811",
    "name": "Renewable Energy Association Of Nig"
  },
  {
    "code": "301819",
    "name": "Rewards Travels & Tours Ltd"
  },
  {
    "code": "301878",
    "name": "Alara Exploit Project Abeokuta Sout"
  },
  {
    "code": "301886",
    "name": "Salawu Muideen Omoyemi"
  },
  {
    "code": "301891",
    "name": "Salvation Travels"
  },
  {
    "code": "301911",
    "name": "Santana Security Agency Limited"
  },
  {
    "code": "301920",
    "name": "Satguru Investment Nig Ltd"
  },
  {
    "code": "301940",
    "name": "Sgs-Cstc Standards Technical Servic"
  },
  {
    "code": "302013",
    "name": "Shoprite"
  },
  {
    "code": "302053",
    "name": "Slot Systems Limited"
  },
  {
    "code": "302062",
    "name": "Smile Identity"
  },
  {
    "code": "302085",
    "name": "Speaky Foods"
  },
  {
    "code": "302098",
    "name": "Squeakyclean Services Limited"
  },
  {
    "code": "302105",
    "name": "Staff Reimbursement- Nigeria"
  },
  {
    "code": "302106",
    "name": "Standard Microfinance Bank Ltd"
  },
  {
    "code": "302119",
    "name": "Streamsowers & Kohn Solicitors"
  },
  {
    "code": "302142",
    "name": "Sunola Foods Limited"
  },
  {
    "code": "302148",
    "name": "Supplier Manual Revaluation"
  },
  {
    "code": "302151",
    "name": "Surebids Limited"
  },
  {
    "code": "302192",
    "name": "Techshelf Hardware And Solutions"
  },
  {
    "code": "302204",
    "name": "Terra Aqua"
  },
  {
    "code": "302210",
    "name": "The Avenue Suites"
  },
  {
    "code": "302218",
    "name": "The Freshies House"
  },
  {
    "code": "302238",
    "name": "The Tintohub"
  },
  {
    "code": "302252",
    "name": "Tonibou Global Properties Enterpris"
  },
  {
    "code": "302286",
    "name": "Udioka Integrated Business Ltd"
  },
  {
    "code": "302301",
    "name": "Ups Nigeria Limited"
  },
  {
    "code": "302304",
    "name": "Usman Sulaiman Abubakar"
  },
  {
    "code": "302305",
    "name": "Uthman Danjum Muhammed."
  },
  {
    "code": "302311",
    "name": "Value Raters Global Services Limite"
  },
  {
    "code": "302314",
    "name": "Vault-Tec Limited"
  },
  {
    "code": "302316",
    "name": "Mycovergenius Limited"
  },
  {
    "code": "302319",
    "name": "Victor Iretekor"
  },
  {
    "code": "302321",
    "name": "Victoria Grand Serene Court"
  },
  {
    "code": "302394",
    "name": "Zayd Communications"
  },
  {
    "code": "302396",
    "name": "Zendesk Inc."
  },
  {
    "code": "302401",
    "name": "Zomy Enterprise"
  },
  {
    "code": "302404",
    "name": "Zymek Enterprise"
  },
  {
    "code": "302464",
    "name": "Eov Logistics And Courier Services"
  },
  {
    "code": "302465",
    "name": "Hash Nation Services Company Limite"
  },
  {
    "code": "302530",
    "name": "Oladapo Solomon"
  },
  {
    "code": "302531",
    "name": "Agama Group"
  },
  {
    "code": "302532",
    "name": "Geestone Ventures"
  },
  {
    "code": "302533",
    "name": "Blessing Computers Limited"
  },
  {
    "code": "302534",
    "name": "Gasali Oladimeji"
  },
  {
    "code": "302535",
    "name": "Asofad Printing Ltd"
  },
  {
    "code": "302536",
    "name": "Ukpong G Okodi"
  },
  {
    "code": "302577",
    "name": "Liktron Technology Limited"
  },
  {
    "code": "302578",
    "name": "Dentons (Ng)"
  },
  {
    "code": "302590",
    "name": "Inq Digital Nigeria"
  },
  {
    "code": "302606",
    "name": "Solan Global Communication"
  },
  {
    "code": "302607",
    "name": "Arete Innovative Concepts Limited"
  },
  {
    "code": "302608",
    "name": "Vdt Communications Limited"
  },
  {
    "code": "302615",
    "name": "Emmanuel Omofuma"
  },
  {
    "code": "302617",
    "name": "Alade Mojisola Roseline"
  },
  {
    "code": "302618",
    "name": "Demehin Augustus"
  },
  {
    "code": "302620",
    "name": "Osbert Event Nigeria"
  },
  {
    "code": "302621",
    "name": "Deftness Marketing Services"
  },
  {
    "code": "302622",
    "name": "Ajala Furniture"
  },
  {
    "code": "302623",
    "name": "Osaruwe Udogwu"
  },
  {
    "code": "302624",
    "name": "Conpserve"
  },
  {
    "code": "302625",
    "name": "Wildone Creative"
  },
  {
    "code": "302629",
    "name": "Bon Almonde"
  },
  {
    "code": "302636",
    "name": "Jimoh Ogundipe"
  },
  {
    "code": "302637",
    "name": "Obudu Mountain Resort"
  },
  {
    "code": "302638",
    "name": "Ashton Integrated Enterprises"
  },
  {
    "code": "302649",
    "name": "Cross Country Limited"
  },
  {
    "code": "302656",
    "name": "Babatunde Adelabu"
  },
  {
    "code": "302658",
    "name": "Proval Logistics Ltd."
  },
  {
    "code": "302688",
    "name": "Phemoye Nigeria Limited"
  },
  {
    "code": "302690",
    "name": "Libra Circle Limited"
  },
  {
    "code": "302691",
    "name": "Harrison-Jay Concepts"
  },
  {
    "code": "302698",
    "name": "Gozie Creative Concept"
  },
  {
    "code": "302700",
    "name": "Asibi Motors"
  },
  {
    "code": "302701",
    "name": "Max Eleghasm"
  },
  {
    "code": "302702",
    "name": "Kamali Abdullahi Adamu"
  },
  {
    "code": "302726",
    "name": "Bolton White Hotels"
  },
  {
    "code": "302727",
    "name": "Golden Tulip Essential"
  },
  {
    "code": "302728",
    "name": "Guess Whot Solutions"
  },
  {
    "code": "302730",
    "name": "Bolnik Technologies Ltd"
  },
  {
    "code": "302734",
    "name": "Speedaf Logistics"
  },
  {
    "code": "302735",
    "name": "Maxbe Continental Hotel"
  },
  {
    "code": "302752",
    "name": "Grey Insights Limited"
  },
  {
    "code": "302761",
    "name": "Veritech Limited"
  },
  {
    "code": "302762",
    "name": "Gilos Property Consultant Ltd"
  },
  {
    "code": "302767",
    "name": "Akwie O. Paradise"
  },
  {
    "code": "302768",
    "name": "Linguatopia"
  },
  {
    "code": "302773",
    "name": "Jesmat Ventures"
  },
  {
    "code": "302783",
    "name": "Eldama Technologies Ltd"
  },
  {
    "code": "302790",
    "name": "Kenechukwu Onyiliogwu"
  },
  {
    "code": "302795",
    "name": "Nweke Francis Emeka"
  },
  {
    "code": "302810",
    "name": "Superior Safety Services"
  },
  {
    "code": "302811",
    "name": "Gaoziah Golden Transit"
  },
  {
    "code": "302821",
    "name": "Goldcrest Media Enterprises"
  },
  {
    "code": "302843",
    "name": "Dovefield Nig Ltd"
  },
  {
    "code": "302845",
    "name": "Khudor Akar"
  },
  {
    "code": "302848",
    "name": "Yemi Abiona & Associates"
  },
  {
    "code": "302849",
    "name": "Balkisu Musa Dan/Illela"
  },
  {
    "code": "302850",
    "name": "Dr. E.A Akinyooye &Ilori Margaret"
  },
  {
    "code": "302852",
    "name": "Sewmart Enterprises"
  },
  {
    "code": "302863",
    "name": "Wellane Health Limited"
  },
  {
    "code": "302864",
    "name": "Mitsumi Nigeria Ltd."
  },
  {
    "code": "302894",
    "name": "Cee & Bee Winners Enterprises"
  },
  {
    "code": "302938",
    "name": "E.B.S Investment Limited"
  },
  {
    "code": "302939",
    "name": "Barachel Global Services Ltd"
  },
  {
    "code": "302940",
    "name": "Hybrid Solicitors"
  },
  {
    "code": "302942",
    "name": "Ganador Event Services"
  },
  {
    "code": "302946",
    "name": "Propel Properties And Facilities Se"
  },
  {
    "code": "302949",
    "name": "World Hepatitis Eradication Initiat"
  },
  {
    "code": "302950",
    "name": "Lola Bolarinwa & Co."
  },
  {
    "code": "302953",
    "name": "Matthew Adeseun"
  },
  {
    "code": "302961",
    "name": "Satefy Fox"
  },
  {
    "code": "302967",
    "name": "Falcon Supply Chain Management Ltd"
  },
  {
    "code": "302993",
    "name": "Endless Creations"
  },
  {
    "code": "302996",
    "name": "Debozgini Nigeria Limited"
  },
  {
    "code": "303012",
    "name": "Cosun Logistics Co.,Ltd"
  },
  {
    "code": "303014",
    "name": "Elohim Solar Resources"
  },
  {
    "code": "303015",
    "name": "Ios Agro And Multi Trade"
  },
  {
    "code": "303016",
    "name": "Kenodenergy"
  },
  {
    "code": "303017",
    "name": "Samluvico Nig. Limited"
  },
  {
    "code": "303064",
    "name": "Mandate Digital Endeavours"
  },
  {
    "code": "303069",
    "name": "Alkun Global Investment Ltd"
  },
  {
    "code": "303070",
    "name": "Squisito Foods"
  },
  {
    "code": "303072",
    "name": "Pearlskye Services Link Limited"
  },
  {
    "code": "303076",
    "name": "Ghofs Tech Global Resources Ltd."
  },
  {
    "code": "303081",
    "name": "Propel Properties & Facilities Serv"
  },
  {
    "code": "303102",
    "name": "Silhouette Holidays"
  },
  {
    "code": "303106",
    "name": "Christopher Onuabuchi Onyekwere"
  },
  {
    "code": "303108",
    "name": "Magsha Africa"
  },
  {
    "code": "303111",
    "name": "Ade & Sayo Real Estate Ltd"
  },
  {
    "code": "303154",
    "name": "Teemobile It Solutions Ltd"
  },
  {
    "code": "303155",
    "name": "Bunmi Food Hub"
  },
  {
    "code": "303161",
    "name": "Whao Logistics Ltd"
  },
  {
    "code": "303165",
    "name": "Srne Solar Co.,Ltd"
  },
  {
    "code": "303166",
    "name": "Ogere Resort"
  },
  {
    "code": "303169",
    "name": "Hearing And Global Services"
  },
  {
    "code": "303170",
    "name": "Flux Logistics-Warehousing"
  },
  {
    "code": "303171",
    "name": "Merit Estates Ltd"
  },
  {
    "code": "303172",
    "name": "Spen Technologies Ltd"
  },
  {
    "code": "303173",
    "name": "Digilogue Electric Limited"
  },
  {
    "code": "303174",
    "name": "Sunbase Solar"
  },
  {
    "code": "303175",
    "name": "Mega Fishers Atlantic Ltd"
  },
  {
    "code": "303176",
    "name": "Samengine Integrated Engineering"
  },
  {
    "code": "303177",
    "name": "Dahlivs Nig Ltd"
  },
  {
    "code": "303178",
    "name": "Abovestar Multibiz Concept Ltd"
  },
  {
    "code": "303179",
    "name": "Mt La Fabrica"
  },
  {
    "code": "303180",
    "name": "Fidelite Btzhub Electrical Compan"
  },
  {
    "code": "303181",
    "name": "Cure Technologies"
  },
  {
    "code": "303182",
    "name": "Jipsal Global Limited"
  },
  {
    "code": "303183",
    "name": "Skitech Solution Express"
  },
  {
    "code": "303184",
    "name": "Zks Global Cencept Nig"
  },
  {
    "code": "303185",
    "name": "Xtragratia Limited"
  },
  {
    "code": "303186",
    "name": "Alabsglobalconcept"
  },
  {
    "code": "303187",
    "name": "Enumason Pmag Nig Ltd"
  },
  {
    "code": "303190",
    "name": "Exworks Engineering"
  },
  {
    "code": "303191",
    "name": "Peerless & Flawless Cleaners Ltd"
  },
  {
    "code": "303194",
    "name": "Samtech Energy And Innovative Resou"
  },
  {
    "code": "303195",
    "name": "Resera Tech Consults"
  },
  {
    "code": "303196",
    "name": "Malvind Consult And Services"
  },
  {
    "code": "303197",
    "name": "Indigo Lightings And Technologies L"
  },
  {
    "code": "303198",
    "name": "Greenwatt Integrated"
  },
  {
    "code": "303199",
    "name": "Erilex Power Solution"
  },
  {
    "code": "303200",
    "name": "Elshemitah Voltage Solutions"
  },
  {
    "code": "303201",
    "name": "De-Kharms Telecommunications Nigeri"
  },
  {
    "code": "303202",
    "name": "Almuraj Engineering & Integrated Se"
  },
  {
    "code": "303207",
    "name": "Snow Delta Communication Enterprise"
  },
  {
    "code": "303233",
    "name": "Dekharms Telecomm Nig Ltd"
  },
  {
    "code": "303260",
    "name": "Bolt"
  },
  {
    "code": "303269",
    "name": "Atlantis Grand Suites"
  },
  {
    "code": "303279",
    "name": "Ocean Ridge General Trading And Log"
  },
  {
    "code": "303286",
    "name": "Asim'S Sport"
  },
  {
    "code": "303287",
    "name": "Kollatunez Tours"
  },
  {
    "code": "303288",
    "name": "Peadals Design"
  },
  {
    "code": "303293",
    "name": "Chibyke Merchandise Network"
  },
  {
    "code": "303315",
    "name": "Cross Country International Benin"
  },
  {
    "code": "303316",
    "name": "Osprime Productions"
  },
  {
    "code": "303317",
    "name": "Seed Of Abraham Technology"
  },
  {
    "code": "303318",
    "name": "Maximum Standard Electrical"
  },
  {
    "code": "303320",
    "name": "Nelson Ibe"
  },
  {
    "code": "303321",
    "name": "Eniola Amodu"
  },
  {
    "code": "303322",
    "name": "Amerukini Nnaji"
  },
  {
    "code": "303323",
    "name": "Christiana Ugo"
  },
  {
    "code": "303327",
    "name": "Bolanle Saka"
  },
  {
    "code": "303328",
    "name": "Macans Global Services Ltd."
  },
  {
    "code": "303339",
    "name": "Rhemaphotovoltaics Nig Ltd"
  },
  {
    "code": "303340",
    "name": "Phigate Technology"
  },
  {
    "code": "303341",
    "name": "Eoe Enterprise Solutions"
  },
  {
    "code": "303342",
    "name": "Diss Telecom Service"
  },
  {
    "code": "303343",
    "name": "Admokad Engineering And Logistics"
  },
  {
    "code": "303344",
    "name": "Elictech Global Limited"
  },
  {
    "code": "303355",
    "name": "Apeiron Global Concepts Limited"
  },
  {
    "code": "303356",
    "name": "Dummy Vendor Benin Republic"
  },
  {
    "code": "303358",
    "name": "Bibb Interiors Ent."
  },
  {
    "code": "303359",
    "name": "Bhd Cons Limited"
  },
  {
    "code": "303360",
    "name": "De Mellisa Enterprises"
  },
  {
    "code": "303361",
    "name": "Zira Smart Sys Solution Ltd"
  },
  {
    "code": "303364",
    "name": "Janoworks Ventures"
  },
  {
    "code": "303368",
    "name": "Net Pc Nigeria Ltd"
  },
  {
    "code": "303369",
    "name": "Philgate Technology"
  },
  {
    "code": "303384",
    "name": "Adebayo Ibrahim Ogundairo"
  },
  {
    "code": "303389",
    "name": "Proton Security Services"
  },
  {
    "code": "303397",
    "name": "Brandeye Media Limited"
  },
  {
    "code": "303414",
    "name": "Hugopeters Global Resources Ltd"
  },
  {
    "code": "303418",
    "name": "C & A Electronics Fze"
  },
  {
    "code": "303426",
    "name": "Jcl Enterprise"
  },
  {
    "code": "303428",
    "name": "Standard Organisation Of Nigeria (S"
  },
  {
    "code": "303436",
    "name": "Prospa/Teenergy Solarsolutions"
  },
  {
    "code": "303437",
    "name": "Phillimonguk Enterprises"
  },
  {
    "code": "303438",
    "name": "Hm Network Co Ltd"
  },
  {
    "code": "303439",
    "name": "Foreman Empire"
  },
  {
    "code": "303440",
    "name": "Timothy Olumide Oyediran"
  },
  {
    "code": "303451",
    "name": "High Goal Intertrans Limited"
  },
  {
    "code": "303462",
    "name": "Fda Logistics"
  },
  {
    "code": "303466",
    "name": "International A&T Tech. First Compa"
  },
  {
    "code": "303468",
    "name": "Dr. Omotosho Micheal"
  },
  {
    "code": "303474",
    "name": "Ress & Vangel"
  },
  {
    "code": "303511",
    "name": "Lightup Energy Resources Global Con"
  },
  {
    "code": "303512",
    "name": "Barry Installation Cares Enterprise"
  },
  {
    "code": "303513",
    "name": "Dudury Concepts"
  },
  {
    "code": "303515",
    "name": "Mike Premium Management"
  },
  {
    "code": "303519",
    "name": "Thames Insurance Brokers & Risk Mgt"
  },
  {
    "code": "303534",
    "name": "Sp Stellar Parallax Ltd"
  },
  {
    "code": "303535",
    "name": "Mirah Branding And Packaging"
  },
  {
    "code": "303546",
    "name": "Shelter Electronics"
  },
  {
    "code": "303560",
    "name": "Pragmatic Technologies"
  },
  {
    "code": "303569",
    "name": "Technologies Automation Systems"
  },
  {
    "code": "303570",
    "name": "Buena Salute Clinic"
  },
  {
    "code": "303581",
    "name": "Asmasan Pictures Ltd"
  },
  {
    "code": "303585",
    "name": "Ajayi Adebowale Alaba"
  },
  {
    "code": "303586",
    "name": "Gabriel Tayo Aituma"
  },
  {
    "code": "303595",
    "name": "Bello Qdot Global Ltd"
  },
  {
    "code": "303601",
    "name": "Pineview Consult"
  },
  {
    "code": "303610",
    "name": "I-Fitness"
  },
  {
    "code": "303613",
    "name": "Ayang Litehouse Intl"
  },
  {
    "code": "303616",
    "name": "Intellecap Advisory Services Privat"
  },
  {
    "code": "303628",
    "name": "Ike Lion Technology Ltd"
  },
  {
    "code": "303629",
    "name": "Tohbellotech Power Solution"
  },
  {
    "code": "303630",
    "name": "Weskoni Nig Ltd"
  },
  {
    "code": "303631",
    "name": "Ajayi Gsimple Steelwork Ventures"
  },
  {
    "code": "303644",
    "name": "Atanda Olusoji Olaoye"
  },
  {
    "code": "303646",
    "name": "Richard Mayowa"
  },
  {
    "code": "303653",
    "name": "Omisope Sunday Johnson"
  },
  {
    "code": "303675",
    "name": "H.P Multi Links Concept"
  },
  {
    "code": "303676",
    "name": "Ernest Frank Elect. And Dig Enterpr"
  },
  {
    "code": "303677",
    "name": "Goodwill Energy And Projector Solut"
  },
  {
    "code": "303678",
    "name": "Visotech Ventures"
  },
  {
    "code": "303682",
    "name": "Mukthar Yahaya Tazan"
  },
  {
    "code": "303683",
    "name": "Ifeanyichukwu Idika (Uyo Shop)"
  },
  {
    "code": "303684",
    "name": "Samir And Zainab Ltd"
  },
  {
    "code": "303685",
    "name": "Adelugbin Kehinde Adedeji"
  },
  {
    "code": "303689",
    "name": "Digital Programmatic Outdoor Displa"
  },
  {
    "code": "303693",
    "name": "Mathias O. Otsaiki"
  },
  {
    "code": "303697",
    "name": "Alametech Electric"
  },
  {
    "code": "303699",
    "name": "Samoa'S Treats"
  },
  {
    "code": "303709",
    "name": "Omo Obalende Plumbing Engineering"
  },
  {
    "code": "303712",
    "name": "Jendor (Wa) Limited"
  },
  {
    "code": "303716",
    "name": "Red Star Freight Limited"
  },
  {
    "code": "303717",
    "name": "Usman Shehu Tijani"
  },
  {
    "code": "303718",
    "name": "Eboh Richard"
  },
  {
    "code": "303723",
    "name": "T2 Photography"
  },
  {
    "code": "303728",
    "name": "Old Lagos Ltd"
  },
  {
    "code": "303751",
    "name": "Lenuzon Limited"
  },
  {
    "code": "303761",
    "name": "Nwodo Joyce Chinwe"
  },
  {
    "code": "303762",
    "name": "Ish Iko Haliru"
  },
  {
    "code": "303765",
    "name": "Campos Memorial Mini Stadium"
  },
  {
    "code": "303792",
    "name": "Onepe Pius Ojoma"
  },
  {
    "code": "303805",
    "name": "Mcnolas Services"
  },
  {
    "code": "303808",
    "name": "Home 8000 Installers"
  },
  {
    "code": "303816",
    "name": "Dr Jay Party & Events World"
  },
  {
    "code": "303817",
    "name": "Executive Guards"
  },
  {
    "code": "303818",
    "name": "Partyshoppersng"
  },
  {
    "code": "303819",
    "name": "Oh Wow Popcorn & Events"
  },
  {
    "code": "303821",
    "name": "Spark Brilliance Limited"
  },
  {
    "code": "303825",
    "name": "Dolphin Telecommunications Ltd."
  },
  {
    "code": "303849",
    "name": "Oyinloye Israel"
  },
  {
    "code": "303850",
    "name": "Ayebo Comfort Ilemobayo"
  },
  {
    "code": "303855",
    "name": "Oladipupo Olajumoke Olanike"
  },
  {
    "code": "303857",
    "name": "Burhana Maikudi Sheshe"
  },
  {
    "code": "303858",
    "name": "Jevinik Restaurant"
  },
  {
    "code": "303859",
    "name": "Rotirem International Multi Biz Nig"
  },
  {
    "code": "303861",
    "name": "Adebayo Soliu Toluwalase"
  },
  {
    "code": "303866",
    "name": "Hst Events"
  },
  {
    "code": "303869",
    "name": "Dez Afrikana Engineering Ltd"
  },
  {
    "code": "303871",
    "name": "Maximums Concept Event Limited"
  },
  {
    "code": "303872",
    "name": "Blessedray Alumunium Venture"
  },
  {
    "code": "303873",
    "name": "Thepamilerin Media"
  },
  {
    "code": "303874",
    "name": "Musa Uba Muhammad"
  },
  {
    "code": "303875",
    "name": "Samsa Foods And Drinks"
  },
  {
    "code": "303877",
    "name": "Bayham Ideas Limited"
  },
  {
    "code": "303881",
    "name": "Techvintage Enterprises"
  },
  {
    "code": "303882",
    "name": "Thess Enterprise"
  },
  {
    "code": "303892",
    "name": "Hartworx Creations Limited"
  },
  {
    "code": "303899",
    "name": "Sinotrans Air Freight Co., Ltd. She"
  },
  {
    "code": "303907",
    "name": "Gentlefred Services Limited"
  },
  {
    "code": "303909",
    "name": "Osaro The Great And Company"
  },
  {
    "code": "303937",
    "name": "Vertex Events And Branding"
  },
  {
    "code": "303940",
    "name": "Emmy O. Uka"
  },
  {
    "code": "303941",
    "name": "Chi Limited"
  },
  {
    "code": "303961",
    "name": "Hill Crest Attorneys"
  },
  {
    "code": "303965",
    "name": "Swift Consulting"
  },
  {
    "code": "303982",
    "name": "Lawma"
  },
  {
    "code": "303989",
    "name": "A Gutagi Nig Ltd"
  },
  {
    "code": "304014",
    "name": "Carter Oriental Ventures"
  },
  {
    "code": "304049",
    "name": "Sir Chubby Business Connect Ltd."
  },
  {
    "code": "304050",
    "name": "Hiq Media Limited"
  },
  {
    "code": "304051",
    "name": "Midtin Consults Limited"
  },
  {
    "code": "304053",
    "name": "Animasahun Babatunde"
  },
  {
    "code": "304054",
    "name": "Niffix Delites Catering Services"
  },
  {
    "code": "304055",
    "name": "Kameel Mb Ventures"
  },
  {
    "code": "304061",
    "name": "Connect Marketing Services Limited"
  },
  {
    "code": "304073",
    "name": "Emmanuel Osunkwo"
  },
  {
    "code": "304101",
    "name": "Olawoagbo Oluwasegun Samson"
  },
  {
    "code": "304108",
    "name": "Enee.Io Ltd"
  },
  {
    "code": "304190",
    "name": "Y.C.N Trading Co.Ltd.Gz"
  },
  {
    "code": "304198",
    "name": "Salmanu Tijani"
  },
  {
    "code": "304199",
    "name": "Thomas Egwuje"
  },
  {
    "code": "304259",
    "name": "Jimoh And Partners"
  },
  {
    "code": "304285",
    "name": "Duke Veronica Eno"
  },
  {
    "code": "304293",
    "name": "Eldama Technologies Limited"
  },
  {
    "code": "304298",
    "name": "Bitonic Technologies Labs Inc"
  },
  {
    "code": "304305",
    "name": "Finsbury Heinz Limited"
  },
  {
    "code": "304314",
    "name": "Lizmor Catering And Events Limited"
  },
  {
    "code": "304316",
    "name": "Quint Marketing Solutions Ltd"
  },
  {
    "code": "304392",
    "name": "Ibrahim Adepeju Alimat"
  },
  {
    "code": "304399",
    "name": "Heriprime Solutions"
  },
  {
    "code": "304427",
    "name": "Ay'S Restaurant & Bar"
  },
  {
    "code": "304428",
    "name": "Marvy'S Cake N Confectionery"
  },
  {
    "code": "304429",
    "name": "Maersk Nigeria"
  },
  {
    "code": "304436",
    "name": "Ayeni Kayode Abraham"
  },
  {
    "code": "304444",
    "name": "Clickbox Media"
  },
  {
    "code": "304449",
    "name": "Hinckley Ewaste Recycling Ltd."
  },
  {
    "code": "304469",
    "name": "Jacra Investment(Sl)Ltd"
  },
  {
    "code": "304471",
    "name": "Adenusi Adetokunbo Wasiu"
  },
  {
    "code": "304488",
    "name": "Richard Nosyaba Odiase"
  },
  {
    "code": "304494",
    "name": "Household Furniture Equipment Limit"
  },
  {
    "code": "304512",
    "name": "Greatsuccess Integrater Service"
  },
  {
    "code": "304513",
    "name": "Bob Enterprise"
  },
  {
    "code": "304515",
    "name": "Bob Confectionery Enterprise"
  },
  {
    "code": "304529",
    "name": "Aptech Africa Ltd"
  },
  {
    "code": "304538",
    "name": "S. Abimbola Gafar"
  },
  {
    "code": "304565",
    "name": "Az Travels And Tours"
  },
  {
    "code": "304580",
    "name": "Emerald Court Residence Solutions"
  },
  {
    "code": "304598",
    "name": "Boldpeak Co. Limited"
  },
  {
    "code": "304604",
    "name": "Best Value Store"
  },
  {
    "code": "304605",
    "name": "Elkabi Nig Ltd"
  },
  {
    "code": "304630",
    "name": "Ikeja Hotel Plc (Sheraton)"
  },
  {
    "code": "304647",
    "name": "Sfordex Electrical & Lightening Co."
  },
  {
    "code": "304652",
    "name": "Daramola Rafiu Atanda"
  },
  {
    "code": "304662",
    "name": "Mf Rating Africa Limited"
  },
  {
    "code": "304677",
    "name": "Caesar'S Court Hotel Suite & Resort"
  },
  {
    "code": "304679",
    "name": "Adelabu Adebayo Adekola"
  },
  {
    "code": "304681",
    "name": "Del B Worldwide Entertainment"
  },
  {
    "code": "304713",
    "name": "Gbolahan Adegbola Samson"
  },
  {
    "code": "304746",
    "name": "Dimensionz Technical Ltd"
  },
  {
    "code": "304773",
    "name": "Coscharis Technoligies Limited"
  },
  {
    "code": "304798",
    "name": "Jappel Pro Services Limited"
  },
  {
    "code": "304799",
    "name": "Abubakar Mohammed Ala"
  },
  {
    "code": "304801",
    "name": "Ebenezer Oyeneyin Akinnowonu"
  },
  {
    "code": "304802",
    "name": "Frank Ikemefune"
  },
  {
    "code": "304820",
    "name": "Zekony Global Ventures"
  },
  {
    "code": "304821",
    "name": "Ip Global Mega Concept Limited"
  },
  {
    "code": "304836",
    "name": "Ibom Resort And Hotels Limited"
  },
  {
    "code": "304859",
    "name": "Topfield Global Logistics Limited"
  },
  {
    "code": "304868",
    "name": "Hippo Logistics Limited"
  },
  {
    "code": "304878",
    "name": "Dura Logistics And Haulage Ltd"
  },
  {
    "code": "304884",
    "name": "Dalogs Intl Investment"
  },
  {
    "code": "304925",
    "name": "Segmac Media Creative"
  },
  {
    "code": "304928",
    "name": "Dan Bade & Associate Ventures"
  },
  {
    "code": "304932",
    "name": "Kahs Investment Ltd"
  },
  {
    "code": "304933",
    "name": "Kahs Investment Ltd"
  },
  {
    "code": "304958",
    "name": "Seg\u2019S Divergence Solutions Ltd"
  },
  {
    "code": "304992",
    "name": "Peadals Designs"
  },
  {
    "code": "305005",
    "name": "Gidan Packaging Industries Limited."
  },
  {
    "code": "305027",
    "name": "Ewig Industries Limited"
  },
  {
    "code": "305056",
    "name": "Swift Connect Logistics Service Lim"
  },
  {
    "code": "305123",
    "name": "Beam World"
  },
  {
    "code": "305124",
    "name": "Skillpaddy Technology Limited"
  },
  {
    "code": "305128",
    "name": "Abubakar Mohammed (Gombe)"
  },
  {
    "code": "305145",
    "name": "Gubabi And Company Limited"
  },
  {
    "code": "305194",
    "name": "G4S Security Services (Nigeria) Lim"
  },
  {
    "code": "305195",
    "name": "Ziba Beach Resort Limited"
  },
  {
    "code": "305197",
    "name": "Haj Hadiza Bashari Tijjani"
  },
  {
    "code": "305200",
    "name": "Kings Guards Nigeria Limited"
  },
  {
    "code": "305220",
    "name": "Mgc Global Risk Advisory Llp"
  },
  {
    "code": "305275",
    "name": "Ics Outsourcing Nigeria Limited"
  },
  {
    "code": "305291",
    "name": "Fontini Global Concepts Limited"
  },
  {
    "code": "305301",
    "name": "Lodestar Legal Partners"
  },
  {
    "code": "305303",
    "name": "Ovie Obobolo & Co"
  },
  {
    "code": "305305",
    "name": "Large Michaels Limted"
  },
  {
    "code": "305306",
    "name": "Nukab General Merchandise"
  },
  {
    "code": "305316",
    "name": "Mousco Allied Heritage Ltd"
  },
  {
    "code": "305344",
    "name": "Mirah Logistics And Services"
  },
  {
    "code": "305345",
    "name": "Justim Energy"
  },
  {
    "code": "305353",
    "name": "Ahmed Ibrahim Musa- Ren/Mad/0433"
  },
  {
    "code": "305354",
    "name": "Onabayo Adewale-Ren/Aku/0431"
  },
  {
    "code": "305355",
    "name": "Saidu Ibrahim Musa-Ren/Min/0432"
  },
  {
    "code": "305356",
    "name": "Christine N. Williams-Ren/Owe/0434"
  },
  {
    "code": "305358",
    "name": "Tdelight Phones And Communications"
  },
  {
    "code": "305374",
    "name": "Sidekicke Marketing Limited"
  },
  {
    "code": "305379",
    "name": "Vicky Ogie Law Firm And Consultants"
  },
  {
    "code": "305384",
    "name": "Medlog Logistics Services Nigeria"
  },
  {
    "code": "305389",
    "name": "Bakare Abdul Azeez"
  },
  {
    "code": "305414",
    "name": "Peter Igbianugo Egwatu-Ren/Ipj/0439"
  },
  {
    "code": "305418",
    "name": "Bluebulb Financials Limited"
  },
  {
    "code": "305453",
    "name": "Global Hubs Multi Concept Ltd"
  },
  {
    "code": "305502",
    "name": "James Ogbulafor-Rental Vendor"
  },
  {
    "code": "305528",
    "name": "Film Service Media"
  },
  {
    "code": "305532",
    "name": "Ison Xperiences International Limit"
  },
  {
    "code": "305553",
    "name": "Lapo (Lardi)"
  },
  {
    "code": "305604",
    "name": "Bi-Courtney Limited"
  },
  {
    "code": "305617",
    "name": "Mac-Folly Hospitality Limited"
  },
  {
    "code": "305625",
    "name": "Sam-Aram & Co"
  },
  {
    "code": "305653",
    "name": "The Prime Providence Hotels & Resor"
  },
  {
    "code": "305667",
    "name": "Risk Analyst Insurance Brokers Limi"
  },
  {
    "code": "305700",
    "name": "Daniel Dick Akpe Imeh (Eket Landlor"
  },
  {
    "code": "305708",
    "name": "Anu-Oluwa M Entp.Ltd"
  },
  {
    "code": "305720",
    "name": "Abel Adeniyi Adeyemi Aiyetoro Land"
  },
  {
    "code": "305820",
    "name": "Mic- Ade Bright Multi-Global Compan"
  },
  {
    "code": "305821",
    "name": "Danjuma Hauwa"
  },
  {
    "code": "305830",
    "name": "Villagesquare Integrated Marketing"
  },
  {
    "code": "305831",
    "name": "Bon Hotel Octagon"
  },
  {
    "code": "305837",
    "name": "Shineforte Legal Practitioners"
  },
  {
    "code": "305845",
    "name": "Matthew Ibikunle (Alakia Shop)"
  },
  {
    "code": "305868",
    "name": "Danjuma Hauwa"
  },
  {
    "code": "305878",
    "name": "Bidi Ace Global"
  },
  {
    "code": "305901",
    "name": "Al- Sulh Attorneys"
  },
  {
    "code": "305936",
    "name": "Afolabi Ibukunoluwa O (Ido West-Sho"
  },
  {
    "code": "305937",
    "name": "J Guide Marketing Limited"
  },
  {
    "code": "305938",
    "name": "Dozie Technologies Limited"
  },
  {
    "code": "305939",
    "name": "Skld Integrated Services Limited"
  },
  {
    "code": "305950",
    "name": "Nancwat Garba Langtan Shop"
  },
  {
    "code": "305951",
    "name": "Td Africa Distributions Limited"
  },
  {
    "code": "305988",
    "name": "Park Inn By Radisson"
  },
  {
    "code": "306000",
    "name": "Atitebi Taiwo Kabiru Moniya Shop"
  },
  {
    "code": "306001",
    "name": "Ngwu Agim Kyrian Obudu Shop"
  },
  {
    "code": "306009",
    "name": "Market Max Limited"
  },
  {
    "code": "306014",
    "name": "Rabiu Abdullahi Chadu Kontagora Sho"
  },
  {
    "code": "306016",
    "name": "Chris Davidson Advisory Ltd"
  },
  {
    "code": "306033",
    "name": "Vincent Owhoso (Ughelli Shop)"
  },
  {
    "code": "306045",
    "name": "Ikponmwosa Nosa Idogbo Shop"
  },
  {
    "code": "306052",
    "name": "Francis Obi & Company Enugu Warehou"
  },
  {
    "code": "306136",
    "name": "Innovation And Ideation Place Limit"
  },
  {
    "code": "306144",
    "name": "Ibrahim Munkaila (Saminaka Shop)"
  },
  {
    "code": "306163",
    "name": "Wandex Top Solutions Services Limit"
  },
  {
    "code": "306181",
    "name": "Vezeti Services Limited"
  },
  {
    "code": "306183",
    "name": "Adapt It Nigeria Limited"
  },
  {
    "code": "306199",
    "name": "Ecart Internet Services Nigeria Lim"
  },
  {
    "code": "306209",
    "name": "Coleman Technical Industries Limite"
  },
  {
    "code": "306213",
    "name": "Urbanwell Oil & Gas Nigeria Limited"
  },
  {
    "code": "306232",
    "name": "Worldwide Partner Logistics Company"
  },
  {
    "code": "306245",
    "name": "Leadway Health Limited"
  },
  {
    "code": "306319",
    "name": "Ibrahim Saidu Larasiki (Mubi Shop)"
  },
  {
    "code": "306366",
    "name": "Vigor Job Search"
  },
  {
    "code": "306367",
    "name": "Teleperformance Nigeria Limited"
  },
  {
    "code": "306395",
    "name": "Idris Makun Jimada (Bida Shop)"
  },
  {
    "code": "306421",
    "name": "Prime Aperture Concepts"
  },
  {
    "code": "306436",
    "name": "Kampari Tours"
  },
  {
    "code": "306437",
    "name": "Atlantic Exhibition Nig Ltd"
  },
  {
    "code": "306451",
    "name": "Double H Ventures (Gusau Shop)"
  },
  {
    "code": "306452",
    "name": "Cardinal Professional Services Llp"
  },
  {
    "code": "306453",
    "name": "Asy Petroleum Nig Ltd (Auchi Shop)"
  },
  {
    "code": "306454",
    "name": "Rabiu Isah (Ningi Shop)"
  },
  {
    "code": "306455",
    "name": "E-Ikrax Properties Nigeria Ltd (Ilo"
  },
  {
    "code": "306457",
    "name": "Shopwithease Enterprise"
  },
  {
    "code": "306471",
    "name": "Chizoba Cyprian (Abakaliki Shop)"
  },
  {
    "code": "306478",
    "name": "Oladiran Paul Olayinka (Oluyole Sho"
  },
  {
    "code": "306498",
    "name": "Newton Electric Limited"
  },
  {
    "code": "401000",
    "name": "Greenlight Planet Inc-Ven"
  },
  {
    "code": "401001",
    "name": "Greenlight Planet India P L-Ven"
  },
  {
    "code": "401002",
    "name": "Greenlight Planet Kenya L-Ven"
  },
  {
    "code": "401003",
    "name": "Greenlight Planet Uganda L-Ven"
  },
  {
    "code": "401005",
    "name": "Greenlight Planet Tanzania L-Ven"
  },
  {
    "code": "401006",
    "name": "Greenlight Planet Zambia L-Ven"
  },
  {
    "code": "401008",
    "name": "Soleva Togo (Sun King)-Ven"
  },
  {
    "code": "401010",
    "name": "Greenlight Planet Cameroon Ltd-Ven"
  },
  {
    "code": "401016",
    "name": "Greenlight Planet Sun King Benin-Ve"
  },
  {
    "code": "401018",
    "name": "Sun King (Sl) Limited"
  },
  {
    "code": "402000",
    "name": "Greenlight Planet Inc-Rtn-Ven"
  },
  {
    "code": "402001",
    "name": "Greenlight Planet India P L-Rtn-Ven"
  },
  {
    "code": "402004",
    "name": "Greenlight Planet Hong Kong L-Rtn-V"
  },
  {
    "code": "402016",
    "name": "Greenlight Planet South Africa-Rtn-"
  },
  {
    "code": "420000",
    "name": "Greenlight Planet India P L - Mh"
  },
  {
    "code": "302099",
    "name": "Squeaky Clean Services Li"
  },
  {
    "code": "300032",
    "name": "Adaba Fm"
  },
  {
    "code": "300033",
    "name": "Adamu A. Bashir"
  },
  {
    "code": "300036",
    "name": "Adebola Makanjuola"
  },
  {
    "code": "300037",
    "name": "Adebowale Real Estate"
  },
  {
    "code": "300091",
    "name": "Akure South Lga"
  },
  {
    "code": "300092",
    "name": "Akwie O .Paradise"
  },
  {
    "code": "300218",
    "name": "Balikisu Yusuf Yahaya"
  },
  {
    "code": "300550",
    "name": "Delta State Government"
  },
  {
    "code": "300634",
    "name": "Easy Buy Imprest - Recove"
  },
  {
    "code": "300656",
    "name": "Egor Local Government"
  },
  {
    "code": "300683",
    "name": "Emmual Osunkwo"
  },
  {
    "code": "300714",
    "name": "Eromosele Akhigbe"
  },
  {
    "code": "304546",
    "name": "F5 Global Enterprise"
  },
  {
    "code": "300835",
    "name": "Gazali Hamza Sulaiman"
  },
  {
    "code": "303587",
    "name": "Hassan Abdulrahman Saleh"
  },
  {
    "code": "300926",
    "name": "Heladio Delicia"
  },
  {
    "code": "300998",
    "name": "Ikenna Ezekwueme"
  },
  {
    "code": "301001",
    "name": "Ilorin East Local Governm"
  },
  {
    "code": "301036",
    "name": "Interswitch Limited"
  },
  {
    "code": "301037",
    "name": "Interswitch Nigeria Ltd"
  },
  {
    "code": "301057",
    "name": "Iwadojemun Ivie Loveth -E"
  },
  {
    "code": "301122",
    "name": "Kaduna Urban Planning And"
  },
  {
    "code": "301135",
    "name": "Karu Local Government"
  },
  {
    "code": "301230",
    "name": "Lagos Business School"
  },
  {
    "code": "301243",
    "name": "Lanre Morakinyo"
  },
  {
    "code": "304102",
    "name": "Maersk Cameroun Sa"
  },
  {
    "code": "301393",
    "name": "Mayowa Owolabi"
  },
  {
    "code": "301448",
    "name": "Mohammed Adamu Zuru"
  },
  {
    "code": "301463",
    "name": "Mr Hassan"
  },
  {
    "code": "301481",
    "name": "Muoghalu Stanley"
  },
  {
    "code": "301557",
    "name": "Njidda Bashir Adamu"
  },
  {
    "code": "301584",
    "name": "Ogueri Kennedy"
  },
  {
    "code": "301585",
    "name": "Ogun State Lga"
  },
  {
    "code": "301588",
    "name": "Ojopagogo Elizabeth"
  },
  {
    "code": "301589",
    "name": "Ola Small Chops"
  },
  {
    "code": "301591",
    "name": "Olajide Oyewole Legal Pra"
  },
  {
    "code": "301596",
    "name": "Olugbemi Olajide"
  },
  {
    "code": "301600",
    "name": "Omojulowo Grace Temitope"
  },
  {
    "code": "301618",
    "name": "Osareme Itamah"
  },
  {
    "code": "301768",
    "name": "Rafiu Olalekan Yekini -Ra"
  },
  {
    "code": "301882",
    "name": "Saifullahi Ja'Afar"
  },
  {
    "code": "301888",
    "name": "Salihu Usman Aliyu"
  },
  {
    "code": "301952",
    "name": "Sharon Grace"
  },
  {
    "code": "302370",
    "name": "Workforce Management Cent"
  },
  {
    "code": "302380",
    "name": "Yau Aliyu"
  },
  {
    "code": "300083",
    "name": "Aisha Mohamed Yunus"
  },
  {
    "code": "300084",
    "name": "Aituma Kenny Agjayere"
  },
  {
    "code": "300086",
    "name": "Ajibade Abdulrasheed"
  },
  {
    "code": "300098",
    "name": "Alhaji Hussaini Aliyu"
  },
  {
    "code": "300099",
    "name": "Alhaji Mu'Azu A Zabira"
  },
  {
    "code": "300100",
    "name": "Alhaji Otunba Olu Ismali"
  },
  {
    "code": "300306",
    "name": "Briggen. Anthony Ukpo"
  },
  {
    "code": "300316",
    "name": "Buhari Mohammed Idris"
  },
  {
    "code": "300435",
    "name": "Conference Hotels Ltd"
  },
  {
    "code": "300826",
    "name": "Gambo Jondi Iliya"
  },
  {
    "code": "300867",
    "name": "Gombe State Local Govt"
  },
  {
    "code": "301231",
    "name": "Lagos State Signage & Adv"
  },
  {
    "code": "306618",
    "name": "TRANSHIPMENT COMPANY LIMITED"
  },
  {
    "code": "300947",
    "name": "HIPHE DESIGNS"
  },
  {
    "code": "306055",
    "name": "CORE INSURANCE SOLUTIONS"
  },
  {
    "code": "305812",
    "name": "ES GOODWILL GLOBAL"
  },
  {
    "code": "305928",
    "name": "FIRSTSTAKE ENTERPRISES"
  },
  {
    "code": "305930",
    "name": "FORNAH-SESAY CIMMONGS & Co (Payroll"
  },
  {
    "code": "305813",
    "name": "GORDON AND ASSOCIATE"
  },
  {
    "code": "401004",
    "name": "Greenlight Planet S K Nigeria L-VEN"
  },
  {
    "code": "306219",
    "name": "ISS-GLOBAL FORWARDING"
  },
  {
    "code": "10420001",
    "name": "Joseph Ansumana-370002"
  },
  {
    "code": "4000004",
    "name": "KKalduf investment Security Agency"
  },
  {
    "code": "305824",
    "name": "KLEIN DORTY CONTRUSTION"
  },
  {
    "code": "305814",
    "name": "LEEGAPOWER AND TOOLS"
  },
  {
    "code": "10420000",
    "name": "Mohamed Samura-370001"
  },
  {
    "code": "305929",
    "name": "NADINE (Warehouse Vendor)"
  },
  {
    "code": "306164",
    "name": "NATIONAL REVENUE AUTHORITY- for GI"
  },
  {
    "code": "306165",
    "name": "NATIONAL REVENUE AUTHORITY- For IMP"
  },
  {
    "code": "305931",
    "name": "OKEKE INVESTMENTS"
  },
  {
    "code": "305823",
    "name": "SAMURA"
  },
  {
    "code": "10420002",
    "name": "Sieh Bangura-370014"
  },
  {
    "code": "304832",
    "name": "Tejan-Cole, Yillah & Partners"
  },
  {
    "code": "200044",
    "name": "Jiangmen Nostop Electric Co., Ltd"
  },
  {
    "code": "200068",
    "name": "Shenzhen Ecosolar Technology Co Ltd"
  },
  {
    "code": "200079",
    "name": "Shenzhen Topray Solar Co., ltd."
  },
  {
    "code": "200170",
    "name": "XIAMEN TRIP SOLAR TECHNOLOGY CO.,LT"
  },
  {
    "code": "200218",
    "name": "R&A Power Electronic Equipment (She"
  },
  {
    "code": "200267",
    "name": "Shenzhen Xiezhen New Energy Co.,Ltd"
  },
  {
    "code": "200276",
    "name": "Shenzhen Lux Power Technology Co.,"
  },
  {
    "code": "304078",
    "name": "Galaxy international"
  },
  {
    "code": "304096",
    "name": "Cameroon Customs"
  },
  {
    "code": "304097",
    "name": "SGS Cameroon S.A"
  },
  {
    "code": "304098",
    "name": "Garantie Mutuelle des Cadres S.A"
  },
  {
    "code": "304103",
    "name": "PIL CAMEROUN S.A"
  },
  {
    "code": "304104",
    "name": "Mediterranean Shipping Company Came"
  },
  {
    "code": "304117",
    "name": "SCI KUETE JEAN"
  },
  {
    "code": "304118",
    "name": "Mulluh & Partners"
  },
  {
    "code": "304127",
    "name": "Ministry of Finance"
  },
  {
    "code": "304128",
    "name": "Faya Hotel Sar;l"
  },
  {
    "code": "304129",
    "name": "Other Vendors"
  },
  {
    "code": "304130",
    "name": "ETS PAUS"
  },
  {
    "code": "304131",
    "name": "Mankis LLC"
  },
  {
    "code": "304132",
    "name": "MTN CAMEROON SA"
  },
  {
    "code": "304135",
    "name": "ORANGE CAMEROUN SA"
  },
  {
    "code": "304136",
    "name": "NONO Jean Marie"
  },
  {
    "code": "304137",
    "name": "ETS Visionary Technologies Company"
  },
  {
    "code": "304138",
    "name": "Industrial Power Solution"
  },
  {
    "code": "304139",
    "name": "STE ICE"
  },
  {
    "code": "304141",
    "name": "Vision Confort S.A"
  },
  {
    "code": "304143",
    "name": "Zenith Insurance"
  },
  {
    "code": "304152",
    "name": "CAMAIR CO SA"
  },
  {
    "code": "304155",
    "name": "AURA Cameroun Sarl"
  },
  {
    "code": "304156",
    "name": "Black House Restaurant Sarl"
  },
  {
    "code": "304160",
    "name": "Vigilant Eagle Security"
  },
  {
    "code": "304168",
    "name": "Eden Care Manpower"
  },
  {
    "code": "304169",
    "name": "HOTEL IBIS SA"
  },
  {
    "code": "304170",
    "name": "ENEO Cameroon SA"
  },
  {
    "code": "304176",
    "name": "Cameroon Water Utilities Corporatio"
  },
  {
    "code": "304189",
    "name": "INQ Digital Cameroon SA"
  },
  {
    "code": "304213",
    "name": "GIYO ENGINE (ERNEST GIYO)"
  },
  {
    "code": "304214",
    "name": "BUREAU STORE AFRICA"
  },
  {
    "code": "304219",
    "name": "SIMIVAL CONSULTING S.A.R.L."
  },
  {
    "code": "304230",
    "name": "PHOENIX ADVISORY LTD"
  },
  {
    "code": "304233",
    "name": "BASSAGAL CONSULTING AFRICA SARL"
  },
  {
    "code": "304239",
    "name": "Staff Reimbursement - CAMEROON"
  },
  {
    "code": "304288",
    "name": "SANLAM ALLIANZ CAMEROUN ASSURANCES"
  },
  {
    "code": "304289",
    "name": "ROYAL ONYX INSURANCE"
  },
  {
    "code": "304320",
    "name": "UNIMAX LTD"
  },
  {
    "code": "304409",
    "name": "EO PAYABLES"
  },
  {
    "code": "304467",
    "name": "STATE OTHER TAXES AND RATES"
  },
  {
    "code": "304540",
    "name": "ETS EDITION RIGO"
  },
  {
    "code": "304542",
    "name": "ETS BEST PRINT"
  },
  {
    "code": "304543",
    "name": "DEPRISE SARL"
  },
  {
    "code": "304544",
    "name": "ETS DANIBUH"
  },
  {
    "code": "304545",
    "name": "PRINTLAND"
  },
  {
    "code": "304553",
    "name": "TECNO"
  },
  {
    "code": "304554",
    "name": "PRO ASSUR SA"
  },
  {
    "code": "304555",
    "name": "SADOU BERNANRD"
  },
  {
    "code": "304556",
    "name": "ETS WORK ACCIDENTS SOLUTIONS (WAS)"
  },
  {
    "code": "304557",
    "name": "CENTRE ORL DE DOUALA"
  },
  {
    "code": "304558",
    "name": "STARTIMES MEDIA CAMEROON SA"
  },
  {
    "code": "304559",
    "name": "AKWA HIN HOTEL DOUALA"
  },
  {
    "code": "304560",
    "name": "TANGA & CO Ltd"
  },
  {
    "code": "304561",
    "name": "MARTIN FOUDA INDUSTRY Sarl"
  },
  {
    "code": "304562",
    "name": "ACN & CO"
  },
  {
    "code": "304714",
    "name": "DIVINE LIGHT SARL"
  },
  {
    "code": "304715",
    "name": "TECNO CAMEROUN SARL"
  },
  {
    "code": "304941",
    "name": "DUMMY VENDOR CMR"
  },
  {
    "code": "305012",
    "name": "BALAFON MEDIA AGENCY SARL"
  },
  {
    "code": "305014",
    "name": "WAFFO KAKABI SIMPLICE"
  },
  {
    "code": "305015",
    "name": "NSIA ASSURANCES"
  },
  {
    "code": "305016",
    "name": "RADIO LEKIE FM OBALA"
  },
  {
    "code": "305017",
    "name": "NK HOTEL LA RESIDENCE"
  },
  {
    "code": "305018",
    "name": "MOKAS SERVICES SARL"
  },
  {
    "code": "305019",
    "name": "HOTEL ZINGANA"
  },
  {
    "code": "305020",
    "name": "2M2L SERVICES SARL"
  },
  {
    "code": "305021",
    "name": "HOTEL BANO PALACE"
  },
  {
    "code": "305028",
    "name": "FIDEMAX SECURITY SERVICES SARL"
  },
  {
    "code": "305030",
    "name": "AL SPEED COMPUTER SARL"
  },
  {
    "code": "305031",
    "name": "CREA GLOBAL"
  },
  {
    "code": "305034",
    "name": "SOCIETE CIVILE IMMOBILIERE PLATINUM"
  },
  {
    "code": "305078",
    "name": "ETS TOGUEM GUY MICHAEL"
  },
  {
    "code": "305110",
    "name": "ETS SHALOM ENGINEERING"
  },
  {
    "code": "305111",
    "name": "SANLAM ALLIANZ CAMEROUN ASSURANCE"
  },
  {
    "code": "305112",
    "name": "TCHOFFO LUCAS"
  },
  {
    "code": "305117",
    "name": "YVETTE WIRNKAR"
  },
  {
    "code": "305142",
    "name": "PMANZ CORPORATION HOLDING"
  },
  {
    "code": "305149",
    "name": "3C CAMEROUN SAS"
  },
  {
    "code": "305151",
    "name": "BRENCORE COMPANY SARL"
  },
  {
    "code": "305152",
    "name": "OVERLINE TRANSPORT & LOGISTIQUES"
  },
  {
    "code": "305153",
    "name": "ETS GALAXY RESTAURANT"
  },
  {
    "code": "305154",
    "name": "ALLPRINT SARL"
  },
  {
    "code": "305158",
    "name": "ICMA DIGITAL EVENT"
  },
  {
    "code": "305207",
    "name": "ADIALEA CAMEROUN SA"
  },
  {
    "code": "305208",
    "name": "ETS AFRIQUE EMERGENCE DU SOLEIL TRO"
  },
  {
    "code": "305209",
    "name": "ETS MITSCAM (Forkum Augustine Cho)"
  },
  {
    "code": "305211",
    "name": "HERITAGE LIMITED"
  },
  {
    "code": "305212",
    "name": "NOUBOU INTERNATIONAL HOTEL"
  },
  {
    "code": "305247",
    "name": "ETMS SARL"
  },
  {
    "code": "305255",
    "name": "SMART LOGISTICS COMPANY LIMITED"
  },
  {
    "code": "305263",
    "name": "OASIS SARL"
  },
  {
    "code": "305285",
    "name": "MME NGEPI NANA S.R EPSE NTANGUEN ME"
  },
  {
    "code": "305478",
    "name": "BUOSON DYNAMICS"
  },
  {
    "code": "305492",
    "name": "Sky Rivers Ltd"
  },
  {
    "code": "305523",
    "name": "IBSIRE CORPORATE"
  },
  {
    "code": "305529",
    "name": "HOTEL MERINA"
  },
  {
    "code": "305542",
    "name": "SANLAM ALLIANZ CAMEROON ASSURANCES"
  },
  {
    "code": "305545",
    "name": "LA CASA SARL"
  },
  {
    "code": "305623",
    "name": "FUN CENTER"
  },
  {
    "code": "305676",
    "name": "ACCENTURE SARL"
  },
  {
    "code": "305839",
    "name": "FLORE SERVICES SARL"
  },
  {
    "code": "305898",
    "name": "EXOTEL TECHCOM PRIVATE LIMITED"
  },
  {
    "code": "305903",
    "name": "MADAME TCHOUA"
  },
  {
    "code": "305984",
    "name": "ETS ELECSERVICES"
  },
  {
    "code": "305987",
    "name": "PROPULSE SOLUTIONS SARL"
  },
  {
    "code": "305995",
    "name": "RADIO NKONGSAMBA FM"
  },
  {
    "code": "306008",
    "name": "ETS NTIWA"
  },
  {
    "code": "306049",
    "name": "NDAM MFOPIT YOUSSOUF FALAX"
  },
  {
    "code": "306066",
    "name": "HOTEL MBIFANO"
  },
  {
    "code": "306067",
    "name": "KM SARL"
  },
  {
    "code": "306077",
    "name": "AVLY TECH"
  },
  {
    "code": "306086",
    "name": "AVENIR SARL"
  },
  {
    "code": "306158",
    "name": "AKWA PALACE"
  },
  {
    "code": "306159",
    "name": "JUJU MAKE"
  },
  {
    "code": "306160",
    "name": "MARKENTHY CONSULTING"
  },
  {
    "code": "306162",
    "name": "KEIME MULTISERVICES"
  },
  {
    "code": "306279",
    "name": "SOCIETE CIVILE IMMOBILIER JOHNLAE"
  },
  {
    "code": "306282",
    "name": "LOGEMENTS DU CAMEROUN"
  },
  {
    "code": "306301",
    "name": "OLYMPIAN HOUSE INTERNATIONAL"
  },
  {
    "code": "306322",
    "name": "SOCIETE AFRICAINE D'HOTELLERIE"
  },
  {
    "code": "306373",
    "name": "NJIKAM NJOYA ABDOULAYE"
  },
  {
    "code": "306414",
    "name": "CIBLEPUB"
  },
  {
    "code": "306444",
    "name": "SOCIETE ATC"
  },
  {
    "code": "306445",
    "name": "ETS ROMAC DISTRIBUTION"
  },
  {
    "code": "306522",
    "name": "B4 PERFECT PLANNING SARL"
  },
  {
    "code": "306547",
    "name": "STE ANIL & SAT TRAVEL & TOURS GPE S"
  },
  {
    "code": "306584",
    "name": "MANOU HOTEL SARL"
  },
  {
    "code": "306593",
    "name": "FORESIGHT"
  },
  {
    "code": "306731",
    "name": "VISION CONFORT S.A"
  },
  {
    "code": "306783",
    "name": "FURNITURE PLAZA SARL"
  },
  {
    "code": "402007",
    "name": "Greenlight Planet S K Nigeria L-RTN"
  },
  {
    "code": "10400020",
    "name": "NJONG PLACIDE NGONG"
  },
  {
    "code": "10400021",
    "name": "MBALA NTUBE ESSIMBI MELANIE"
  },
  {
    "code": "10400022",
    "name": "ENOW MPANG NGALLE LYDIENNE"
  },
  {
    "code": "10400023",
    "name": "HENRI LOLO CHRETEL KOMBI"
  },
  {
    "code": "10400024",
    "name": "DIKOUS SEND HUGUES PABLO"
  },
  {
    "code": "10400025",
    "name": "FUHSHU MACFEBE NGUM"
  },
  {
    "code": "10400028",
    "name": "SAMUEL FONLON YUVEN"
  },
  {
    "code": "10400030",
    "name": "KASSIM DAHIROU ND"
  },
  {
    "code": "10400031",
    "name": "NSABINLA ANASTASIA WASE"
  },
  {
    "code": "10400032",
    "name": "YVETTE WIRNKAR"
  },
  {
    "code": "10400033",
    "name": "NKOUMOU ENDONG VIVIEN THAIR"
  },
  {
    "code": "10400034",
    "name": "TSAFANG MEKAM TINA URKEL"
  },
  {
    "code": "305721",
    "name": "AF&AE (Carelle kounou)"
  },
  {
    "code": "305864",
    "name": "Akpakpa Warehouse (DJENGUE SENAMI CHARLAINE)"
  },
  {
    "code": "305863",
    "name": "Allada Store (AGUEHOUNDE LIMATA)"
  },
  {
    "code": "305750",
    "name": "Misserete Shop DJEKETE NOUDEHOUENOU ROBERT"
  },
  {
    "code": "305751",
    "name": "ATLANTIQUE ASSURANCE BENIN IARDT"
  },
  {
    "code": "305752",
    "name": "SICA-CI (Carelle kounou)"
  },
  {
    "code": "305753",
    "name": "SBIN CELTIIS BENIN"
  },
  {
    "code": "305754",
    "name": "SPACETEL Benin S.A. MTN BENIN"
  },
  {
    "code": "305755",
    "name": "MOOV AFRICA S.A"
  },
  {
    "code": "305756",
    "name": "PLANETECH SARL"
  },
  {
    "code": "305757",
    "name": "ROCH GBANHOUNME"
  },
  {
    "code": "305758",
    "name": "CODJO GERARDO MARCOS AYI"
  },
  {
    "code": "305759",
    "name": "HOME RESIDENCE HOTEL"
  },
  {
    "code": "305760",
    "name": "SAFARI CONCEPT"
  },
  {
    "code": "305761",
    "name": "MYRESTO"
  },
  {
    "code": "305762",
    "name": "CAF GERME"
  },
  {
    "code": "305763",
    "name": "LA VOIX DE LA LAMA"
  },
  {
    "code": "305764",
    "name": "L AFRICAINE VIE BENIN"
  },
  {
    "code": "305805",
    "name": "REHOROF"
  },
  {
    "code": "305772",
    "name": "HOTEL LES PALMIERS DORES"
  },
  {
    "code": "305858",
    "name": "AFRICAS TALKING SARL"
  },
  {
    "code": "305773",
    "name": "ETS SHALOM EMPIRE"
  },
  {
    "code": "305774",
    "name": "ZOUNGNON ABDEL AZIZ"
  },
  {
    "code": "305775",
    "name": "MED'ART ELECTRONIQUES"
  },
  {
    "code": "305776",
    "name": "MAKOUHOUI OLIVIER"
  },
  {
    "code": "305777",
    "name": "ZEHOU JULES"
  },
  {
    "code": "305778",
    "name": "GCAR SERVICES"
  },
  {
    "code": "305779",
    "name": "SISTERN SECURITY"
  },
  {
    "code": "305780",
    "name": "WORLD ENERGY TECHNOLOGY (SOCIETE WET SARL)"
  },
  {
    "code": "305781",
    "name": "ETS VIA AGATHA"
  },
  {
    "code": "305865",
    "name": "FATCHAO MARCELLINE NADOU"
  },
  {
    "code": "305782",
    "name": "NEXTECH"
  },
  {
    "code": "305859",
    "name": "SENOUGBE VIGNIAVO CHIMENE"
  },
  {
    "code": "305783",
    "name": "DD BAT (Office cleaning)"
  },
  {
    "code": "305784",
    "name": "RADIO ALOHADO"
  },
  {
    "code": "305785",
    "name": "Creat ive Corp"
  },
  {
    "code": "305786",
    "name": "DONG GUAN LEGION ELECTRONIC"
  },
  {
    "code": "305841",
    "name": "freight forwarder ALBATROS"
  },
  {
    "code": "305787",
    "name": "DJOSSA BENOIT ESPOIR"
  },
  {
    "code": "305788",
    "name": "DOFONWAKOU ALPHONSE"
  },
  {
    "code": "305789",
    "name": "HOUNSINOU MAHOUNAN POLYNICE MARC-AUREL"
  },
  {
    "code": "305790",
    "name": "4H SARL"
  },
  {
    "code": "305791",
    "name": "COCOON GUEST HOUSE SARL"
  },
  {
    "code": "305807",
    "name": "GROUPE IDUNU (Klik Klak Appart Hotel)"
  },
  {
    "code": "305792",
    "name": "BENIN ROYAL HOTEL"
  },
  {
    "code": "305842",
    "name": "ARTS TECHNOLOGIE"
  },
  {
    "code": "305808",
    "name": "NET SERVICE (MADEMOISELLE GOUDAN LILIANE MARTHE)"
  },
  {
    "code": "305809",
    "name": "AKL PLUS"
  },
  {
    "code": "305843",
    "name": "BABEL SERVICE"
  },
  {
    "code": "305793",
    "name": "MONT SINAI SARL"
  },
  {
    "code": "305810",
    "name": "KUEGAH CHOUCHOUDA FOLLY NYENLONTO 1ER"
  },
  {
    "code": "305844",
    "name": "GERDDES AFRIQUE RADIO\u00a0F.M"
  },
  {
    "code": "305855",
    "name": "SOGADJI, NONDJIGNON GRACIA\u00a0MAURELLE"
  },
  {
    "code": "305861",
    "name": "Bohicon Shop (ABLET LEON CYRILLE)"
  },
  {
    "code": "305794",
    "name": "VENUS Events (NASSARA ORNELLA CANDIDA MAHOUTIN)"
  },
  {
    "code": "305860",
    "name": "Myriad Connect SASU"
  },
  {
    "code": "305856",
    "name": "ZOUIHOUE LEGBASSI SETONDJI\u00a0PAUL"
  },
  {
    "code": "305795",
    "name": "AGOSSOU NOUNAGNON AUGUSTIN"
  },
  {
    "code": "305857",
    "name": "FONDATION WANNOU"
  },
  {
    "code": "200001",
    "name": "Hierq Enterprises Limited"
  },
  {
    "code": "200168",
    "name": "Bestway Industrial (HK) Limited"
  },
  {
    "code": "200232",
    "name": "Shenzhen Royqueen Audio Technology"
  },
  {
    "code": "200295",
    "name": "JEANNE'S WONDERS"
  },
  {
    "code": "301266",
    "name": "LIKTRON TECHNOLOGY LIMITED"
  },
  {
    "code": "302627",
    "name": "Sena Kwadzo Ayenu"
  },
  {
    "code": "303659",
    "name": "VAS CABINET CONSEIL"
  },
  {
    "code": "303660",
    "name": "Maison Phone et Informatique (MPI)"
  },
  {
    "code": "303661",
    "name": "MATH VISION"
  },
  {
    "code": "303663",
    "name": "Computer plus"
  },
  {
    "code": "303664",
    "name": "ENTREPRISE DES INGENIEURS CIVILS (E"
  },
  {
    "code": "303666",
    "name": "ORCA"
  },
  {
    "code": "303727",
    "name": "ETOILE GRAPHIC DESIGN"
  },
  {
    "code": "303746",
    "name": "LA POSTE"
  },
  {
    "code": "303780",
    "name": "BIGMAN INTERNATIONAL"
  },
  {
    "code": "303781",
    "name": "STAR TECHNOLOGIES"
  },
  {
    "code": "303787",
    "name": "Dummy vendor"
  },
  {
    "code": "303795",
    "name": "NVINIO GROUP"
  },
  {
    "code": "303800",
    "name": "FIDELIA ASSURANCE"
  },
  {
    "code": "303807",
    "name": "GTA C2A ASSURANCE IARDT"
  },
  {
    "code": "303814",
    "name": "ADJIH KOMLA MAWUDUDZI"
  },
  {
    "code": "303815",
    "name": "AMOUZOU KOKOU DODJI"
  },
  {
    "code": "303983",
    "name": "EO PAYABLES"
  },
  {
    "code": "303997",
    "name": "SANLAM ASSURANCE TOGO"
  },
  {
    "code": "303999",
    "name": "AMS LAGRACE"
  },
  {
    "code": "304001",
    "name": "OURO GBELEOU Bassirou"
  },
  {
    "code": "304002",
    "name": "Shenzhen Ningzexin Solar"
  },
  {
    "code": "304003",
    "name": "Shenzhen Ani Technology Co., Ltd"
  },
  {
    "code": "304004",
    "name": "DEARBON SARL"
  },
  {
    "code": "304005",
    "name": "EXPERT AGENCY"
  },
  {
    "code": "304018",
    "name": "Clinique Biasa"
  },
  {
    "code": "304044",
    "name": "SYLPRINT COMMUNICATION"
  },
  {
    "code": "304045",
    "name": "SOCIETE MULTI SERVICE DU TOGO SARL"
  },
  {
    "code": "304046",
    "name": "TOGOCEL"
  },
  {
    "code": "304052",
    "name": "Marcel E. DEGBOE"
  },
  {
    "code": "304106",
    "name": "ETS DAZI AZIZE"
  },
  {
    "code": "304212",
    "name": "SCI LES COCOTIERS"
  },
  {
    "code": "304238",
    "name": "KASSAMADA DZOSSOU KODZO"
  },
  {
    "code": "304249",
    "name": "AGENTS PHONES PURCHASE"
  },
  {
    "code": "304251",
    "name": "SGS STANDARDS TECHNICAL SERV LTD"
  },
  {
    "code": "304297",
    "name": "NANGOU & FILS SARL-U"
  },
  {
    "code": "304387",
    "name": "SYLPERFECT SERVICES"
  },
  {
    "code": "304492",
    "name": "KNAM HOUSE SARL U"
  },
  {
    "code": "304503",
    "name": "DATT LABEL"
  },
  {
    "code": "304568",
    "name": "T-OCEAN SUPPLY CHAIN HONG KONG LIMI"
  },
  {
    "code": "304645",
    "name": "YATOMBO TADANLENGA"
  },
  {
    "code": "304646",
    "name": "IMPRIMERIE OCCIDENTALE"
  },
  {
    "code": "304656",
    "name": "GVA TOGO"
  },
  {
    "code": "304657",
    "name": "ONOMO HOTEL LOME"
  },
  {
    "code": "304658",
    "name": "BIWELON KOSSI"
  },
  {
    "code": "304683",
    "name": "AFANOU ADJOWA CHRISTINE"
  },
  {
    "code": "304745",
    "name": "ASKY AIRLINES"
  },
  {
    "code": "304747",
    "name": "KEKE KOKOU CYRILLE"
  },
  {
    "code": "304750",
    "name": "GRANT THORNTON"
  },
  {
    "code": "304751",
    "name": "WISSITOBOLINI Esso-Wazina (Sokode s"
  },
  {
    "code": "304755",
    "name": "DABONTIN EDWIGE"
  },
  {
    "code": "304756",
    "name": "BATORA COMLAN K BADJIDA"
  },
  {
    "code": "304757",
    "name": "COMMUNE DE WAWA"
  },
  {
    "code": "304767",
    "name": "CNTIC SARL"
  },
  {
    "code": "304803",
    "name": "MADON HKM"
  },
  {
    "code": "304808",
    "name": "AGBESSI JULES CODJO"
  },
  {
    "code": "304809",
    "name": "BIEN-\u00caTRE DESIGN"
  },
  {
    "code": "304848",
    "name": "HORAT COMMUNICATION"
  },
  {
    "code": "304936",
    "name": "SHAMA PRODUCTION"
  },
  {
    "code": "304937",
    "name": "N'DATI LAPA"
  },
  {
    "code": "304938",
    "name": "EL PARAISO"
  },
  {
    "code": "305038",
    "name": "SAER"
  },
  {
    "code": "305041",
    "name": "YAHAYA Abdoubaki"
  },
  {
    "code": "305042",
    "name": "TCHAKAN Kossi"
  },
  {
    "code": "305043",
    "name": "DRISHTI-SOFT SOLUTIONS PRIVATE LIMI"
  },
  {
    "code": "305044",
    "name": "SFE-CRV"
  },
  {
    "code": "305045",
    "name": "ETS ENYO VOYAGES"
  },
  {
    "code": "305046",
    "name": "HOTEL EL DORIA"
  },
  {
    "code": "305047",
    "name": "Mutuelle de sant\u00e9 Doumevi"
  },
  {
    "code": "305051",
    "name": "MAITRE PIYAKI ASSOUMANOU"
  },
  {
    "code": "305057",
    "name": "ACHTEC"
  },
  {
    "code": "305058",
    "name": "BRIGHT FILMS CONCEPT"
  },
  {
    "code": "305059",
    "name": "Lome Shop"
  },
  {
    "code": "305060",
    "name": "LE SAVOIR MON ARME (SMA)"
  },
  {
    "code": "305061",
    "name": "GIGA SOLUTION SARL U"
  },
  {
    "code": "305062",
    "name": "NADJA BOUGONOU"
  },
  {
    "code": "305076",
    "name": "LA PROSPERITE BARACHIEL"
  },
  {
    "code": "305084",
    "name": "MARKETING PLUS AFRIQUE (MPA)"
  },
  {
    "code": "305087",
    "name": "ETS MBK"
  },
  {
    "code": "305192",
    "name": "YIME YAOVI"
  },
  {
    "code": "305269",
    "name": "LIVER FILE INTERNATIONAL KANAL FM"
  },
  {
    "code": "305270",
    "name": "INTER FREQUENCE SARL"
  },
  {
    "code": "305271",
    "name": "ETABLISSEMENT NANA MEDIA CULTURE"
  },
  {
    "code": "305349",
    "name": "NCIM"
  },
  {
    "code": "305350",
    "name": "LYDER GROUP"
  },
  {
    "code": "305352",
    "name": "JACQUES ESTHER"
  },
  {
    "code": "305357",
    "name": "SARL EDIAZUR"
  },
  {
    "code": "305539",
    "name": "TRAINING CERTIFICATION PRO"
  },
  {
    "code": "305540",
    "name": "NOVA CONNECT"
  },
  {
    "code": "305618",
    "name": "UNIVERS DES NOUVELLES TECHNOLOGIES"
  },
  {
    "code": "305619",
    "name": "VOLTIC TOGO SARL"
  },
  {
    "code": "305662",
    "name": "NICE DIGITAL PRINT SARL U"
  },
  {
    "code": "305692",
    "name": "AP Industry"
  },
  {
    "code": "305716",
    "name": "AGENCE D'INTERMEDIATION ET DE LOGIS"
  },
  {
    "code": "305739",
    "name": "HOTEL PETIT BRUSSEL"
  },
  {
    "code": "305740",
    "name": "ARISE CORPORATION"
  },
  {
    "code": "305741",
    "name": "KING MICHEAL TRADE COM SARL"
  },
  {
    "code": "305840",
    "name": "Integral Corporation"
  },
  {
    "code": "305851",
    "name": "HOTEL SARAKAWA"
  },
  {
    "code": "305862",
    "name": "GROUP ZENITH"
  },
  {
    "code": "305904",
    "name": "RAMCO"
  },
  {
    "code": "305924",
    "name": "SANOUSSI FOUSSENI"
  },
  {
    "code": "305992",
    "name": "ACTU LOME SARL"
  },
  {
    "code": "305993",
    "name": "ADKONTACT TECHNOLOGIES"
  },
  {
    "code": "306020",
    "name": "SOCIETE D'EXPLOITATION HOTELIERE ET"
  },
  {
    "code": "306027",
    "name": "Computer Plus"
  },
  {
    "code": "306082",
    "name": "ETO-SOLUTIONS SARLU"
  },
  {
    "code": "306134",
    "name": "MOITA CHIOU IS HAKOU"
  },
  {
    "code": "306147",
    "name": "DREAM ART"
  },
  {
    "code": "306285",
    "name": "FORS 360"
  },
  {
    "code": "306315",
    "name": "OPTIDIS"
  },
  {
    "code": "306394",
    "name": "HOTEL SOLIM PALACE"
  },
  {
    "code": "306422",
    "name": "SMCE"
  },
  {
    "code": "306449",
    "name": "AUREOLE TRANSIT INTERNATIONAL"
  },
  {
    "code": "306450",
    "name": "IS AFRIC"
  },
  {
    "code": "306469",
    "name": "AHP TOGO"
  },
  {
    "code": "306568",
    "name": "Pro Security Agency"
  },
  {
    "code": "306569",
    "name": "ABALO AFI AWASUABOE"
  },
  {
    "code": "306578",
    "name": "TABLIGBO (AMOUZOU MESSAN AMEWONOU)"
  },
  {
    "code": "306602",
    "name": "EDON Koffivi"
  },
  {
    "code": "306611",
    "name": "CETEF"
  },
  {
    "code": "306663",
    "name": "AFRICA DEM PRO"
  },
  {
    "code": "306664",
    "name": "KOLTA SARL"
  },
  {
    "code": "306667",
    "name": "M MEDIA AFRIQUE"
  },
  {
    "code": "306668",
    "name": "AGS FRASERS TOGO"
  },
  {
    "code": "306676",
    "name": "AGENCE POINT COM"
  },
  {
    "code": "306677",
    "name": "RADIO TCHAMBA"
  },
  {
    "code": "306750",
    "name": "AMEG BENITO"
  },
  {
    "code": "306751",
    "name": "CENPATO"
  },
  {
    "code": "306770",
    "name": "TECTEO CONSULTING"
  },
  {
    "code": "306771",
    "name": "NIBI GKD"
  },
  {
    "code": "306801",
    "name": "NET PRESTATION SARL"
  },
  {
    "code": "306802",
    "name": "TOUR DES ANGES"
  },
  {
    "code": "306815",
    "name": "Bush N Blooms Ltd"
  },
  {
    "code": "306836",
    "name": "LYD EVENTS SARL U"
  },
  {
    "code": "306839",
    "name": "EXCEL GROUP"
  },
  {
    "code": "200214",
    "name": "Dong Guan Legion Electronic Technol"
  },
  {
    "code": "300936",
    "name": "High Goal Intertrans Limited"
  },
  {
    "code": "302250",
    "name": "T-OCEAN SUPPLY CHAIN HONG KONG LIMI"
  },
  {
    "code": "304768",
    "name": "ZOIA CONSULTING PTY LTD TA DOTS REC"
  },
  {
    "code": "304769",
    "name": "D KAUFMANN INCORPORATED t/a ANDERSE"
  },
  {
    "code": "304770",
    "name": "SCHENKER SOUTH AFRICA (PTY) LTD"
  },
  {
    "code": "304818",
    "name": "MAKSURE FINANCIAL HOLDINGS"
  },
  {
    "code": "304834",
    "name": "MS IMMIGRATION ADVISORY (PTY) LTD"
  },
  {
    "code": "304839",
    "name": "MOPUMO HOLDINGS (PTY) LTD"
  },
  {
    "code": "304845",
    "name": "MANVEST PTY LTD"
  },
  {
    "code": "304846",
    "name": "SATGURU TRAVELS (Pty ) LTD"
  },
  {
    "code": "304847",
    "name": "Izipho Functions Pty Ltd"
  },
  {
    "code": "304851",
    "name": "Tiamo Deli"
  },
  {
    "code": "304852",
    "name": "TRIPLE A HOTELS"
  },
  {
    "code": "304853",
    "name": "KAMSAM National (Pty) Ltd"
  },
  {
    "code": "304854",
    "name": "KKP GENERAL SUPPLIERS"
  },
  {
    "code": "304855",
    "name": "BANASONS TRADING"
  },
  {
    "code": "304857",
    "name": "RAM SUPPLY CHAIN SOLUTIONS(PTY)LTD"
  },
  {
    "code": "304889",
    "name": "Burstone Group Limited"
  },
  {
    "code": "304893",
    "name": "Discovery Health (Pty) Ltd"
  },
  {
    "code": "304906",
    "name": "MALL OF THEMBISA (PTY) LTD"
  },
  {
    "code": "304908",
    "name": "Network Space (Pty) Ltd"
  },
  {
    "code": "304989",
    "name": "TEMOGO UNLIMITED (PTY) LTD"
  },
  {
    "code": "305003",
    "name": "DISCOVERY LIFE INVESTMENT SERVICES"
  },
  {
    "code": "305004",
    "name": "Discovery Invest"
  },
  {
    "code": "305037",
    "name": "EO PAYABLES"
  },
  {
    "code": "305065",
    "name": "SILIFA INVESTMENTS"
  },
  {
    "code": "305083",
    "name": "BIDVEST SERVICES (PTY) LTD"
  },
  {
    "code": "305090",
    "name": "E W Tools and Industrial Supplies C"
  },
  {
    "code": "305092",
    "name": "TransUnion Credit Bureau (Pty) Ltd"
  },
  {
    "code": "305094",
    "name": "MCE GLOBAL SUPPLIERS JHB (PTY) LTD"
  },
  {
    "code": "305262",
    "name": "AZEEMAH MAHOMED AUDIOLOGY"
  },
  {
    "code": "305642",
    "name": "BON FREIGHT (PTY) LTD"
  },
  {
    "code": "305660",
    "name": "MVEKAS SOLUTIONS (PTY) LTD"
  },
  {
    "code": "305678",
    "name": "Nexia SAB&T"
  },
  {
    "code": "305687",
    "name": "FIRST AID TRAINING SA (PTY) LTD"
  },
  {
    "code": "305925",
    "name": "KHOLWA UQAKAZE TRADING ENTERPRISE"
  },
  {
    "code": "306112",
    "name": "KATHEX SOLAR"
  },
  {
    "code": "306140",
    "name": "MASPROCLEAN"
  },
  {
    "code": "306339",
    "name": "THIADI EVENTS AND CATERING PTY LTD"
  },
  {
    "code": "306340",
    "name": "MOBILE TELEPHONE NETWORKS PTY LTD"
  },
  {
    "code": "306346",
    "name": "HENEWAYS FREIGHT SERVICES (PTY) LTD"
  },
  {
    "code": "306351",
    "name": "PC INTERNATIONAL"
  },
  {
    "code": "306356",
    "name": "Sandican"
  },
  {
    "code": "306381",
    "name": "Cube Workspace"
  },
  {
    "code": "306382",
    "name": "Saddle Creek Adventures"
  },
  {
    "code": "306383",
    "name": "Pepic & Kraus Print pty Ltd t/a L&K"
  },
  {
    "code": "306465",
    "name": "WEB SQUAD CONNECT PTY LTD"
  },
  {
    "code": "306532",
    "name": "LENDAM GROUP - SHEQ AND FACILITY"
  },
  {
    "code": "306558",
    "name": "EASY RIDE TOURS AND SERVICES (PTY)"
  },
  {
    "code": "306625",
    "name": "COMPUTECH - SOLUTIONS"
  },
  {
    "code": "306651",
    "name": "ZALFA PROPERTY INVESTMENTS 2 CC"
  },
  {
    "code": "306712",
    "name": "PITTED OLIVE CATERING SERVICES"
  },
  {
    "code": "306715",
    "name": "MAKEPE FRANCIS MANAMELA"
  },
  {
    "code": "306716",
    "name": "Smoko NJ Sekgala"
  },
  {
    "code": "306781",
    "name": "RI CARGO CC"
  },
  {
    "code": "306799",
    "name": "Dummy Vendor-South Africa"
  },
  {
    "code": "306840",
    "name": "RAM TRANSPORT (SOUTH AFRICA) (PTY)"
  },
  {
    "code": "10380000",
    "name": "Tshwaro Ricardo Mothupi"
  },
  {
    "code": "10380001",
    "name": "Zanele Peggy Mkhwanazi"
  },
  {
    "code": "10380002",
    "name": "Anelisa Molefe"
  },
  {
    "code": "10380003",
    "name": "Emanuel Pako"
  },
  {
    "code": "10380004",
    "name": "Thona Nede Manuel"
  },
  {
    "code": "10380005",
    "name": "Andrew John Peypers"
  },
  {
    "code": "10380006",
    "name": "Londiwe Nokulunga Masuku"
  },
  {
    "code": "10380007",
    "name": "Mathopane Cherrif Mashilo"
  },
  {
    "code": "10380008",
    "name": "Vhusani Ramabulana"
  },
  {
    "code": "10380009",
    "name": "Blessings Zibusiso Sambo"
  },
  {
    "code": "10380010",
    "name": "Oreneile Tshimologo Maloka"
  },
  {
    "code": "10380011",
    "name": "Sisa Mputumi Lingani"
  },
  {
    "code": "10380012",
    "name": "Moipone Sarah Tagane"
  },
  {
    "code": "10380013",
    "name": "Gugulethu Vacu"
  },
  {
    "code": "10380014",
    "name": "Tanduxolo Mqatazana"
  },
  {
    "code": "10380015",
    "name": "Olebogeng Mompati"
  },
  {
    "code": "10380017",
    "name": "Makhuvha Tendani"
  },
  {
    "code": "10380018",
    "name": "Joseph Tshele Mantshiyane"
  },
  {
    "code": "10380019",
    "name": "Kayaletu Mziwonke Mapukata"
  },
  {
    "code": "10380020",
    "name": "Thabo Maake"
  },
  {
    "code": "10380021",
    "name": "Liepollo Rabelemane-900024"
  },
  {
    "code": "10380022",
    "name": "Precious Ndawonde-900029"
  },
  {
    "code": "10380023",
    "name": "Thabo Siphesihle Ngubane-900030"
  },
  {
    "code": "10380024",
    "name": "Fhatuwani Donah Magadani-900031"
  },
  {
    "code": "10380025",
    "name": "Amelin Motswiane-900032"
  },
  {
    "code": "10380026",
    "name": "Vumani Ayanda Basi-200025"
  },
  {
    "code": "10380027",
    "name": "Sinethemba Lubeni-900033"
  },
  {
    "code": "10380028",
    "name": "Lindelani Madzhie-900034"
  },
  {
    "code": "10380029",
    "name": "Keletso Mugwena-900027"
  },
  {
    "code": "10380030",
    "name": "Mpho Makaringe-900028"
  },
  {
    "code": "10380031",
    "name": "Xolane Handsom Tshabalala-200023"
  },
  {
    "code": "10380032",
    "name": "Tshilidzi Prudence Masindi-900026"
  },
  {
    "code": "500004",
    "name": "SIGNAGE PRODUCTION STUDIO CC"
  },
  {
    "code": "500006",
    "name": "DEPARTMENT OF LABOUR (SOUTH AFRICA)"
  }
]

export default function SeedPage() {
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const addLog = (msg: string) => setLog(prev => [...prev, msg])

  const seedCollection = async (name: string, items: { code: string; name: string }[]) => {
    addLog(`Seeding ${name} (${items.length} records)...`)
    const snap = await getDocs(collection(db, name))
    for (const d of snap.docs) await deleteDoc(doc(db, name, d.id))
    addLog(`  Cleared ${snap.size} existing records`)
    let count = 0
    for (const item of items) {
      await addDoc(collection(db, name), item)
      count++
      if (count % 50 === 0) addLog(`  ${count}/${items.length} done...`)
    }
    addLog(`  ✓ ${items.length} ${name} seeded`)
  }

  const handleSeed = async () => {
    setRunning(true)
    setLog([])
    try {
      await seedCollection("costCenters", COST_CENTERS)
      await seedCollection("vendors", VENDORS)
      addLog("✓ All done! Remove /seed from App.tsx when confirmed.")
      setDone(true)
    } catch (e) {
      addLog(`ERROR: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Firestore Seeder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Seeds 239 cost centers + 1,209 vendors into Firestore. Run once only.
        </p>
      </div>
      <div className="rounded-xl border border-yellow-800 bg-yellow-900/20 p-4 text-sm text-yellow-300">
        ⚠ This will <strong>clear and re-seed</strong> costCenters and vendors collections. Run once only.
      </div>
      <Button onClick={handleSeed} disabled={running || done}
        className="gap-2 bg-green-600 hover:bg-green-700 text-white">
        {running ? <><Loader2 className="size-4 animate-spin" /> Seeding...</> :
         done ? <><CheckCircle2 className="size-4" /> Done</> : "Run Seed"}
      </Button>
      {log.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
          {log.map((line, i) => (
            <p key={i} className={
              line.startsWith("ERROR") ? "text-red-400" :
              line.startsWith("✓") ? "text-green-400" : "text-muted-foreground"
            }>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
