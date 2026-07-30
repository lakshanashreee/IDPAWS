locals {
  common_tags = {
    CostCentre = "Project"
  }

  cloudfront_tags = {
    CostCentre = "Project"
    Wafrule    = "idp-waf-nonprod-standard"
  }
}
